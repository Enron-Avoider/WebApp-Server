const { RESTDataSource } = require("apollo-datasource-rest");
const { ObjectId } = require("mongodb");
const { customAlphabet, urlAlphabet } = require("nanoid");

const { EODDataMaps } = require("../data-maps");
const mathToMongo = require("../utils/mathToMongo");
const chunkUp = require("../utils/chunkUp");

module.exports = {
  Ours: class extends RESTDataSource {
    constructor(mongoDB) {
      super();

      this.keys = {};

      this.mongoDBStocksTable = mongoDB.collection("Stocks");
      this.mongoDBRatioCollectionTable = mongoDB.collection("RatioCollection");
    }

    searchStocks = async ({ name }) => {
      const stocksInDB = await this.mongoDBStocksTable
        .find(
          {
            $or: [
              { code: { $regex: name, $options: "i" } },
              { name: { $regex: name, $options: "i" } },
            ],
            is_in_exchange_country: true,
          },
          { name: 1, code: 1, market_capitalization: 1 }
        )
        .sort({ market_capitalization: -1 })
        .limit(10)
        .toArray();

      return stocksInDB;
    };

    getStockByCode = async ({ code }) => {
      const [Ticker, EODExchange] = code.split(".");

      const stockInDB = await this.mongoDBStocksTable.findOne({
        code: Ticker,
        ...(EODExchange && { EODExchange }),
        is_in_exchange_country: true,
      });

      return stockInDB;
    };

    getAggregate = async ({ sector, industry, country, exchange }) => {
      // for every row/calc
      //  - sum  |> SUM(n)
      //  - avg  |> SUM(n)/n
      //  - median |> .sort.find(n/2)
      //  - max |> .sort.find(n)
      //  - min |> .sort.find(0)
      //  - deciles

      // countries | exchanges | sectors > industries || rows&calcs | period
      //    -- percentils/normal distribution --      ||
      //           stock value | history?             ||

      // year       *-*     *
      // country    *-*     exchange
      // country    *-*     sector
      // country    *-*     industry
      // exchange   *-*     sectors
      // exchange   *-*     industry
      // sector     1-*     industry

      // rows

      // year
      // country
      // sector
      // industry
      // exchange

      // metric / ratio (1)

      const counts = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...(sector && { sector }),
                ...(industry && { industry }),
                ...(country && { country }),
                ...(exchange && { exchange }),
              },
            },
            {
              $facet: {
                ...["country", "exchange", "industry", "sector"].reduce(
                  (p, c) => ({
                    ...p,
                    [c]: [
                      {
                        $group: {
                          _id: `$${c}`,
                          count: {
                            $sum: 1,
                          },
                        },
                      },
                      { $sort: { count: -1 } },
                    ],
                  }),
                  {}
                ),
              },
            },
          ])
          .toArray();

      const yearlyCounts = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...(sector && { sector }),
                ...(industry && { industry }),
                ...(country && { country }),
                ...(exchange && { exchange }),
              },
            },
            {
              $unwind: {
                path: "$yearlyFinancials.years",
              },
            },
            {
              $facet: {
                ...["country", "exchange", "industry", "sector"].reduce(
                  (p, c) => ({
                    ...p,
                    [c]: [
                      {
                        $group: {
                          _id: {
                            [c]: `$${c}`,
                            year: "$yearlyFinancials.years",
                          },
                          count: {
                            $sum: 1,
                          },
                        },
                      },
                      { $sort: { "_id.year": -1 } },
                      {
                        $group: {
                          _id: {
                            [c]: `$_id.${c}`,
                          },
                          years: {
                            $push: {
                              year: "$_id.year",
                              count: "$count",
                            },
                          },
                        },
                      },
                      { $sort: { "years.1.count": -1 } },
                    ],
                  }),
                  {}
                ),
              },
            },
          ])
          .toArray();

      const yearlyAvgs = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...(sector && { sector }),
                ...(industry && { industry }),
                ...(country && { country }),
                ...(exchange && { exchange }),
                yearlyFinancialsWithKeys: {
                  $exists: true,
                },
              },
            },
            {
              $addFields: {
                marketCap: {
                  $objectToArray:
                    "$yearlyFinancialsWithKeys.marketCap.Market Cap",
                },
              },
            },
            {
              $unwind: {
                path: "$marketCap",
              },
            },
            {
              $facet: {
                ...["country", "exchange", "industry", "sector"].reduce(
                  (p, c) => ({
                    ...p,
                    [c]: [
                      {
                        $group: {
                          _id: {
                            [c]: `$${c}`,
                            year: "$marketCap.k",
                          },
                          count: {
                            $sum: 1,
                          },
                          sum: {
                            $sum: "$marketCap.v",
                          },
                          avg: {
                            $avg: "$marketCap.v",
                          },
                          stdDevPop: {
                            $stdDevPop: "$marketCap.v",
                          },
                        },
                      },
                      { $sort: { "_id.year": -1 } },
                      {
                        $group: {
                          _id: {
                            [c]: `$_id.${c}`,
                          },
                          years: {
                            $push: {
                              year: "$_id.year",
                              count: "$count",
                              sum: "$sum",
                              avg: "$avg",
                              stdDev: "$stdDevPop",
                            },
                          },
                        },
                      },
                      { $sort: { "years.1.count": -1 } },
                    ],
                  }),
                  {}
                ),
              },
            },
          ])
          .toArray();

      //   console.log({ counts });

      return {
        query: { sector, industry, country, exchange },
        // count: stocks.length,
        counts: await counts(),
        // years,
        yearlyCounts: await yearlyCounts(),
        yearlyAvgs: await yearlyAvgs(),
        // financials,
      };
    };

    getAggregateForStock = async ({
      sector,
      industry,
      country,
      exchange,
      calcs,
    }) => {
      const defaultRows = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...(sector && { sector }),
                ...(industry && { industry }),
                ...(country && { country }),
                ...(exchange && { exchange }),
              },
            },
            {
              $unwind: {
                path: "$yearlyFinancialsByYear",
              },
            },
            {
              $facet: {
                ...EODDataMaps.rowKeysPaths
                  .map((k) => ({
                    fieldName: k.replace(/\./g, "_"),
                    path: `yearlyFinancialsByYear.${k}.v`,
                  }))
                  .reduce(
                    (p, { fieldName, path }) => ({
                      ...p,
                      [fieldName]: [
                        {
                          $project: {
                            name: 1,
                            code: 1,
                            "yearlyFinancialsByYear.year": 1,
                            [path]: { $toDecimal: `$${path}` },
                          },
                        },
                        {
                          $sort: {
                            [path]: -1,
                          },
                        },
                        {
                          $group: {
                            _id: {
                              year: "$yearlyFinancialsByYear.year",
                            },
                            [`count`]: {
                              $sum: 1,
                            },
                            [`sum`]: {
                              $sum: `$${path}`,
                            },
                            [`avg`]: {
                              $avg: `$${path}`,
                            },
                            [`companies`]: {
                              $push: {
                                company: "$name",
                                code: "$code",
                                v: `$${path}`,
                              },
                            },
                          },
                        },
                        {
                          $sort: {
                            "_id.year": -1,
                          },
                        },
                      ],
                    }),
                    {}
                  ),
              },
            },
          ])
          .toArray();

      const calcRows = async () => {
        const calcs_ = calcs.map((c) => {
          const paths = Object.values(c.scope).map(
            (v) => `yearlyFinancialsByYear.${v}.v`
          );

          return {
            fieldName: c.title.replace(/\./g, "_"),
            calc: mathToMongo(
              c.calc,
              paths.map((p) => `$${p}`)
            ),
            paths,
          };
        });

        return await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...(sector && { sector }),
                ...(industry && { industry }),
                ...(country && { country }),
                ...(exchange && { exchange }),
              },
            },
            {
              $unwind: {
                path: "$yearlyFinancialsByYear",
              },
            },
            {
              $addFields: {
                ...calcs_.reduce(
                  (p, { fieldName, calc, paths }) => ({
                    ...p,
                    [`calc_${fieldName}`]: calc,
                  }),
                  {}
                ),
              },
            },
            {
              $facet: {
                ...calcs_.reduce(
                  (p, { fieldName, calc, paths }) => ({
                    ...p,
                    [`calc_${fieldName}`]: [
                      {
                        $project: {
                          name: 1,
                          code: 1,
                          "yearlyFinancialsByYear.year": 1,
                          [`calc_${fieldName}`]: {
                            $toDecimal: `$calc_${fieldName}`,
                          },
                          //   [path]: { $toDecimal: `$${path}` },
                        },
                      },
                      {
                        $sort: {
                          [`calc_${fieldName}`]: -1,
                        },
                      },
                      {
                        $group: {
                          _id: {
                            year: "$yearlyFinancialsByYear.year",
                          },
                          [`count`]: {
                            $sum: 1,
                          },
                          [`sum`]: {
                            $sum: `$${`calc_${fieldName}`}`,
                          },
                          [`avg`]: {
                            $avg: `$${`calc_${fieldName}`}`,
                          },
                          [`companies`]: {
                            $push: {
                              company: "$name",
                              code: "$code",
                              v: `$${`calc_${fieldName}`}`,
                            },
                          },
                        },
                      },
                      {
                        $sort: {
                          "_id.year": -1,
                        },
                      },
                    ],
                  }),
                  {}
                ),
              },
            },
          ])
          .toArray();
      };

      return {
        query: { sector, industry, country, exchange },
        ...(calcs && { calcRows: (await calcRows())[0] }),
        defaultRows: (await defaultRows())[0],
      };
    };

    getAllExchanges = async () => {
      // TODO
    };

    getAllIndustries = async () => {
      // TODO
    };

    getDistinctStockNames = async () => {
      const getDistinctStockNames = await this.mongoDBStocksTable.distinct(
        "name"
      );

      return {
        count: getDistinctStockNames.length,
        names: getDistinctStockNames,
      };
    };

    saveBatchOfStocksToDB = async ({ stockBatch }) => {
      const workingBatch = await Promise.all(
        stockBatch.map(async ({ Code, Exchange, EODExchange }, i) => {
          const stockInDB = (
            await this.mongoDBStocksTable
              .find({
                code: Code,
                EODExchange,
              })
              .toArray()
          )[0];

          if (
            !!stockInDB &&
            (new Date() - new Date(stockInDB.retrieved_at)) /
              (1000 * 60 * 60 * 24) <
              14
          ) {
            return "Skipped [Updated < 14 days ago]: " + Code + "." + Exchange;
          }

          const stock = await this.getStockByCode({
            code: Code + "." + EODExchange,
          })
            .then((s) => ({
              ...s,
              ...(!s.is_in_exchange_country && {
                yearlyFinancials: null,
                yearlyFinancialsWithKeys: null,
                yearlyFinancialsByYear: null,
              }),
            }))
            .catch((e) => {
              console.log(
                "Failed: " + Code + "." + Exchange + "." + EODExchange
              );
              return {};
            });

          // console.log(`${Code}.${Exchange} ${!!stockInDB} ${stock.is_in_exchange_country}`);

          if (!!stockInDB) {
            const updated = await this.mongoDBStocksTable.updateOne(
              { _id: stockInDB._id },
              { $set: { ...stock } }
            );
            return "Updated: " + Code + "." + Exchange + "." + EODExchange;
          } else if (stock.code) {
            const inserted = await this.mongoDBStocksTable.insertOne(stock);
            return "Created: " + Code + "." + Exchange + "." + EODExchange;
          } else {
            return "Failed: " + Code + "." + Exchange + "." + EODExchange;
          }
        })
      );

      return workingBatch;
    };

    updateStocksCompletely = async () => {
      // get exchanges
      const ExchangesFromEODAPI = await this.getAllExchanges();
      // get exchange Stock codes
      const loopThroughExchangesOneByOne = await ExchangesFromEODAPI.reduce(
        async (accUnresolved, exchange, i) => {
          const accResolved = await accUnresolved;

          console.log(`working on exchange`, { exchange: exchange.Name });

          await new Promise((t) => setTimeout(t, 1000));

          const exchangeStocks = (
            await this.getExchangeStocks({
              code: exchange.Code,
            })
          ).stocks;

          // bundle stock codes
          const exchangeStockBatches = chunkUp(exchangeStocks, 10);

          const savedExchangeStocks = await exchangeStockBatches.reduce(
            async (accUnresolved, stockBatch, i) => {
              const accResolved = await accUnresolved;

              await new Promise((t) => setTimeout(t, 100));
              const savedStocks = await this.saveBatchOfStocksToDB({
                stockBatch,
              });

              console.log({
                progress: `${(i / exchangeStockBatches.length) * 100}%`,
                savedStocks,
              });

              return [...accResolved, ...savedStocks];
            },
            []
          );

          return [
            ...accResolved,
            {
              ...exchange,
              stockCount: exchangeStocks.length,
              exchangeStockBatchesCount: exchangeStockBatches.length,
              savedExchangeStocks,
            },
          ];
        },
        []
      );

      return loopThroughExchangesOneByOne;
    };

    removeEmptyAndDuplicates = async () => {
      const dupes = await this.mongoDBStocksTable
        .aggregate([
          {
            $group: {
              _id: {
                code: "$code",
                EODExchange: "$EODExchange",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
          {
            $match: {
              count: {
                $gt: 1,
              },
            },
          },
        ])
        .toArray();

      //   const empties = await this.mongoDBStocksTable
      //     .find({ code: { $exists: false } })
      //     .toArray();

      //   const removeEmpties = await this.mongoDBStocksTable
      //     .remove({ code: { $exists: false } });

      const dupesLoop = await dupes.reduce(async (accUnresolved, dupe, i) => {
        const accResolved = await accUnresolved;

        await new Promise((t) => setTimeout(t, 10));

        const stockInDB = (
          await this.mongoDBStocksTable
            .find({
              code: dupe._id.code,
              EODExchange: dupe._id.EODExchange,
            })
            .toArray()
        )[0];

        // const removeDupe = await this.mongoDBStocksTable.remove({
        //   _id: ObjectId(stockInDB._id),
        // });

        console.log({
          progress: `${i} / ${dupes.length}`,
          dupe,
          stockInDB: ObjectId(stockInDB._id),
        });

        return [...accResolved, dupe];
      }, []);

      return {
        count: dupes.length,
        dupes,
      };
    };

    getRatioCollections = async () => {
      return await this.mongoDBRatioCollectionTable.find().toArray();
    };

    getUniqueNanoid = async (table) => {
      const nanoid = customAlphabet(urlAlphabet, 2)();

      const nanoidInDB = (
        await table
          .find({
            nanoid,
          })
          .toArray()
      )[0];

      if (!!nanoidInDB) {
        console.log(`${nanoid} already used`);
        return this.getUniqueNanoid(table);
      } else {
        return nanoid;
      }
    };

    saveRatioCollection = async ({ ratioCollection }) => {
      // TODO: check permission

      console.log("heeeere!!", {
        ratioCollection: JSON.stringify(ratioCollection, null, 2),
      });

      const ratioCollectionInDB =
        ratioCollection.nanoid &&
        (
          await this.mongoDBRatioCollectionTable
            .find({
              id: ratioCollection.id,
            })
            .toArray()
        )[0];

      const newNanoid = await this.getUniqueNanoid(
        this.mongoDBRatioCollectionTable
      );

      if (!!ratioCollectionInDB) {
        const updated = await this.mongoDBRatioCollectionTable.updateOne(
          { _id: ratioCollectionInDB._id },
          { $set: { ...ratioCollection } }
        );
        console.log(`updated ${ratioCollection.name}`);
      } else {
        const created = await this.mongoDBRatioCollectionTable.insertOne({
          ...ratioCollection,
          id: newNanoid,
        });
        console.log(`created ${ratioCollection.name}`);
      }

      return {
        ...ratioCollection,
        id: !!ratioCollectionInDB ? ratioCollectionInDB.id : newNanoid,
        // isOwnedByPlatform: 'TODO',
        // isOwnedByUser: 'TODO'
      };
    };
  },
};
