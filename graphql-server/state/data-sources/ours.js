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
      this.mongoDBAggregationsCacheTable = mongoDB.collection(
        "AggregationsCache"
      );
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

    getLastYearCounts = async ({ query }) => {
      const lastYear = new Date().getFullYear() - 1;

      const counts = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...query,
                "yearlyFinancials.years": {
                  $in: [`${lastYear}`],
                },
                is_in_exchange_country: true,
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

      return {
        query,
        counts: (await counts())[0],
      };
    };

    getAggregationThroughCacheIfPossible = async ({
      cacheQuery,
      getUncachedAggregationFn,
      getUncachedAggregationParameters,
    }) => {
      const aggregationInDB = (
        await this.mongoDBAggregationsCacheTable
          .find({
            cacheQuery,
          })
          .toArray()
      )[0];

      if (!!aggregationInDB) {
        console.log("in db", { cacheQuery });
        return aggregationInDB.object;
      } else {
        console.log("not in db", { cacheQuery });
        const object = await getUncachedAggregationFn(
          getUncachedAggregationParameters
        );
        const inserted = await this.mongoDBAggregationsCacheTable.insertOne({
          cacheQuery,
          object,
          retrieved_at: Date.now(),
        });
        await new Promise((t) => setTimeout(t, 1000));
        return object;
      }
    };

    getAggregateForFinancialRows = async ({
      query,
      stockToRank,
      companiesForRow,
    }) => {
      const getSomeFinancialRows = async ({ rowKeysPathsBatch }) =>
        (
          await this.mongoDBStocksTable
            .aggregate(
              [
                {
                  $match: {
                    ...query,
                    is_in_exchange_country: true,
                  },
                },
                {
                  $unwind: {
                    path: "$yearlyFinancialsByYear",
                  },
                },
                {
                  $facet: {
                    ...rowKeysPathsBatch
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
              ],
              { allowDiskUse: true }
            )
            .toArray()
        )[0];

      const getAllFinancialRows = async ({
        query,
        stockToRank,
        companiesForRow,
      }) => {
        const rowKeysPathsBatches = chunkUp(
          EODDataMaps.rowKeysPaths.filter(
            (k) => !companiesForRow || companiesForRow === k
          ),
          1
        );

        return await rowKeysPathsBatches.reduce(
          async (accUnresolved, batch, i) => {
            const accResolved = await accUnresolved;

            const batchResults = await this.getAggregationThroughCacheIfPossible(
              {
                cacheQuery: {
                  type: "someFinancialRows",
                  query,
                  rowKeysPathsBatch: batch,
                },
                getUncachedAggregationFn: getSomeFinancialRows,
                getUncachedAggregationParameters: { rowKeysPathsBatch: batch },
              }
            );

            return {
              ...accResolved,
              // ...batchResults,
              ...Object.entries(batchResults).reduce(
                (p, [k, v]) => ({
                  ...p,
                  [k]: v.map((v_) => ({
                    ...v_,
                    companies: companiesForRow
                      ? v_.companies
                      : v_.companies.length,
                    ...(stockToRank && {
                      rank: ((r) => (r > -1 ? r + 1 : "-"))(
                        v_.companies.findIndex(
                          (company) => company.company === stockToRank
                        )
                      ),
                    }),
                  })),
                }),
                {}
              ),
            };
          },
          {}
        );
      };

      const financialRows = Object.keys(query).length
        ? await this.getAggregationThroughCacheIfPossible({
            cacheQuery: {
              type: "allFinancialRows",
              query,
              stockToRank,
              companiesForRow,
            },
            getUncachedAggregationFn: getAllFinancialRows,
            getUncachedAggregationParameters: {
              query,
              stockToRank,
              companiesForRow,
            },
          })
        : {};

      return {
        query,
        financialRows,
      };
    };

    getAggregateForCalcRows = async ({
      query,
      calcs,
      stockToRank,
      collectionId,
      companiesForRow,
    }) => {
      console.log("yeeeep", {
        collectionId
      });

      const collection = (
        await this.mongoDBRatioCollectionTable
          .find({
            id: collectionId,
          })
          .toArray()
      )[0];

      const getCalcRows = async ({
        query,
        stockToRank,
        companiesForRow,
        calcs,
      }) => {
        const calcs_ = calcs
          .filter((c) => !companiesForRow || companiesForRow === c.title)
          .map((c) => {
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

        return (
          await this.mongoDBStocksTable
            .aggregate([
              {
                $match: query,
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
            .toArray()
        ).map((c) =>
          Object.entries(c).reduce(
            (p, [k, v]) => ({
              ...p,
              [k]: v.map((v_) => ({
                ...v_,
                companies: companiesForRow ? v_.companies : v_.companies.length,
                ...(stockToRank && {
                  rank: ((r) => (r > -1 ? r + 1 : "-"))(
                    v_.companies.findIndex(
                      (company) => company.company === stockToRank
                    )
                  ),
                }),
              })),
            }),
            {}
          )
        )[0];
      };

      const calcRows = Object.keys(query).length
        ? await this.getAggregationThroughCacheIfPossible({
            cacheQuery: {
              type: "calcRows",
              query,
              stockToRank,
              companiesForRow,
              collectionId,
            },
            getUncachedAggregationFn: getCalcRows,
            getUncachedAggregationParameters: {
              query,
              stockToRank,
              companiesForRow,
              calcs: collection.calcs,
            },
          })
        : {};

      return {
        query,
        collectionId,
        // calcs: collection.calcs,
        calcRows,
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
            id: nanoid,
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

      const ratioCollectionInDB =
        ratioCollection.id &&
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
        console.log(`updated ${ratioCollection.name} ${ratioCollection.id}`);
      } else {
        const created = await this.mongoDBRatioCollectionTable.insertOne({
          ...ratioCollection,
          id: newNanoid,
        });
        console.log(`created ${ratioCollection.name} ${newNanoid}`);
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
