const { RESTDataSource } = require("apollo-datasource-rest");
const parse = require("csv-parse");

const { EODDataMaps } = require("../data-maps");
const mathToMongo = require("../utils/mathToMongo");

module.exports = {
  EODDataAPI: class extends RESTDataSource {
    constructor(mongoDB) {
      super();

      this.keys = {
        eodhistoricaldata: "5f80d8849f6b13.09550863",
      };

      this.mongoDBStocksTable = mongoDB.collection("tests");
      this.mongoDBIndustriesTable = mongoDB.collection("Industries");
      this.mongoDBStocksTable = mongoDB.collection("Stocks");
    }

    findStockByName = async ({ name }) => {
      const res = await this.get(
        `
          https://eodhistoricaldata.com/api/screener?
              api_token=${this.keys.eodhistoricaldata}&
              sort=market_capitalization.desc&
              filters=[
                  ["name","match","*${name}*"]
              ]
          `.replace(/\s/g, "")
      );
      return res.data;
    };

    findStockByTicker = async ({ name }) => {
      const res = await this.get(
        `
          https://eodhistoricaldata.com/api/screener?
              api_token=${this.keys.eodhistoricaldata}&
              sort=market_capitalization.desc&
              filters=[
                  ["code","match","*${name}*"]
              ]
          `.replace(/\s/g, "")
      );
      return res.data;
    };

    getStockByCode = async ({ code }) => {
      const fundamentalData = await this.get(
        `
          https://eodhistoricaldata.com/api/fundamentals/${code}?
            api_token=${this.keys.eodhistoricaldata}
        `.replace(/\s/g, "")
      );

      const priceData = await this.get(
        `
            https://eodhistoricaldata.com/api/eod/${code}?
                period=m&
                fmt=json&
                api_token=${this.keys.eodhistoricaldata}
        `
      );

      const yearlyFinancials =
        Object.keys(fundamentalData).length &&
        fundamentalData.Highlights &&
        EODDataMaps.convertEODFundamentalsToEarlyFinancials(
          fundamentalData,
          priceData
        );

      const yearlyFinancialsWithKeys = EODDataMaps.yearlyFinancialsWithKeys(
        yearlyFinancials
      );

      const yearlyFinancialsByYear = EODDataMaps.yearlyFinancialsFlatByYear(
        yearlyFinancialsWithKeys
      );

      //   const yearlyFinancialsForTable = EODDataMaps.yearlyFinancialsForTable(
      //     yearlyFinancials
      //   );

      return Object.keys(fundamentalData).length && fundamentalData.Highlights
        ? {
            code: fundamentalData.General.Code,
            name: fundamentalData.General.Name,
            country: fundamentalData.General.CountryName,
            exchange: fundamentalData.General.Exchange,
            EDOExchange:
              fundamentalData.General.CountryISO === "US"
                ? "US"
                : fundamentalData.General.Exchange,
            currency_symbol: fundamentalData.General.CurrencySymbol,
            currency_code: fundamentalData.General.CurrencyCode,
            // ...(fundamentalData.General.CurrencyCode === "GBX" && {
            //   currency_symbol: "£",
            //   currency_code: "GBP",
            // }),
            market_capitalization:
              fundamentalData.Highlights.MarketCapitalization,
            sector: fundamentalData.General.Sector,
            industry: fundamentalData.General.Industry,
            description: fundamentalData.General.Description,
            logo: fundamentalData.General.LogoURL
              ? "eodhistoricaldata.com" + fundamentalData.General.LogoURL
              : null,
            yearlyFinancials,
            yearlyFinancialsWithKeys,
            // yearlyFinancialsByYear
          }
        : {};
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

    getAggregateForStock = async ({ sector, industry, country, exchange, calcs }) => {
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
        // const calcs_ = [
        //   {
        //     title: "Market Cap",
        //     scope: {
        //       a: "aggregatedShares.outstandingShares",
        //       b: "price.price",
        //     },
        //     calc: "a*b",
        //   },
        // ];

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
                ...calcs_
                  .reduce(
                    (p, { fieldName, calc, paths }) => ({
                      ...p,
                      [`calc_${fieldName}`]: [
                        {
                          $project: {
                            name: 1,
                            "yearlyFinancialsByYear.year": 1,
                            [`calc_${fieldName}`]: 1
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
                                [`calc_${fieldName}`]: `$${`calc_${fieldName}`}`,
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
        ...calcs && { calcRows: (await calcRows())[0] },
        defaultRows: (await defaultRows())[0],
      };
    };

    getAllExchanges = async () => {
      return await this.get(`
        https://eodhistoricaldata.com/api/exchanges-list/?api_token=${this.keys.eodhistoricaldata}
      `);
    };

    getAllIndustries = async () => {
      const csv = await this.get(
        `http://eodhistoricaldata.com/download/SectorIndustries.csv`
      );

      const json = (
        await new Promise((r) =>
          parse(csv, { columns: true, trim: true }, (err, output) => r(output))
        )
      )
        .filter((item) => item.industry !== "\\N")
        .filter((item) => item.industry.length);

      return json;
    };

    saveIndustriesToDB = async () => {
      const getAll = await this.mongoDBIndustriesTable.find({}).toArray();
      //   const deleteAll = await Promise.all(
      //     getAll.map(async (obj) => this.mongoDBIndustriesTable.deleteOne(obj))
      //   );

      console.log({ getAllLength: getAll.length });

      const SectorsAndIndustries = await this.getAllIndustries();

      const saved = await SectorsAndIndustries.reduce(
        async (accUnresolved, { sector, industry }, i) => {
          const accResolved = await accUnresolved;

          await new Promise((t) => setTimeout(t, 10));

          const getThisOne = await this.mongoDBIndustriesTable
            .find({
              industry,
              sector,
            })
            .toArray();

          //   console.log(industry + " " + getThisOne.length);

          if (getThisOne.length !== 0) {
            console.log(
              "Existing: " +
                industry +
                " | " +
                i +
                "/" +
                SectorsAndIndustries.length
            );
            return [...accResolved];
          } else {
            console.log(
              "ADDING: " +
                industry +
                " " +
                i +
                "/" +
                SectorsAndIndustries.length
            );

            const industryStocks = await this.getIndustryStocks({
              name: encodeURIComponent(industry),
            });

            const industryRes = {
              sector,
              industry: industry,
              stocks: industryStocks,
            };

            const insertOne = await this.mongoDBIndustriesTable.insertOne(
              industryRes
            );

            console.log("ADDED:   " + industry + " | " + industryStocks.length);

            return [
              ...accResolved,
              { sector, industry, stocksCount: industryStocks.length },
            ];
          }
        },
        []
      );

      return saved;
    };

    saveAllStocksToDB = async () => {
      const getAllIndustries = await this.mongoDBIndustriesTable
        .find({})
        .toArray();
      // .splice(100);

      console.log({ getAllIndustries, l: getAllIndustries.length });

      //   const getAllStocks = await this.mongoDBStocksTable.find({}).toArray();
      //   console.log({
      //     getAllStocksCount: getAllStocks.length,
      //   });
      //   const deleteAllStocks = await Promise.all(
      //     getAllStocks.map(async (obj) =>
      //       this.mongoDBStocksTable.deleteOne({
      //         code: obj.code,
      //         exchange: obj.exchange,
      //       })
      //     )
      //   );

      const saved = await getAllIndustries.reduce(
        async (accUnresolved, { sector, industry, stocks }, i) => {
          const accResolved = await accUnresolved;

          console.log(`INDUSTRY: ${industry} | ${stocks.length}`);

          const chunkUp = (array, size) => {
            const chunked_arr = [];
            let index = 0;
            while (index < array.length) {
              chunked_arr.push(array.slice(index, size + index));
              index += size;
            }
            return chunked_arr;
          };

          const stockBatches = chunkUp(stocks, 150);

          //   console.log(stockBatches.length);

          const savedIndustryStocks = await stockBatches.reduce(
            async (accUnresolved, stockBatch, i) => {
              const accResolved = await accUnresolved;

              await new Promise((t) => setTimeout(t, 500));

              //   console.log("stockBatch.length: "+stockBatch.length);

              const workingBatch = await Promise.all(
                stockBatch.map(async ({ code, exchange, industry }, i) => {
                  //

                  const getThisOne = await this.mongoDBStocksTable
                    .find({
                      code,
                      EDOExchange: exchange,
                    })
                    .toArray();

                  if (getThisOne.length !== 0) {
                    console.log("EXISTING: " + code + "." + exchange);
                    return;
                  } else {
                    console.log("ADDING: " + code + "." + exchange);

                    const stock = await this.getStockByCode({
                      code: code + "." + exchange,
                    });

                    if (Object.keys(stock).length && stock.code !== null) {
                      const insertOne = await this.mongoDBStocksTable
                        .insertOne(stock)
                        .catch((err) => {
                          console.log({ err });
                        });

                      console.log(
                        "ADDED: " +
                          code +
                          "." +
                          exchange +
                          " | " +
                          stock.exchange
                      );
                    } else {
                      console.log("NOPE: " + code + "." + exchange);
                    }

                    return code + "." + exchange;
                  }
                })
              );
            },
            []
          );

          return [
            ...accResolved,
            {
              industry,
            },
          ];
        },
        []
      );

      return saved;
    };

    updateStocksInDB = async () => {
      const getAllStocks = await this.mongoDBStocksTable
        .find({ yearlyFinancialsByYear: { $exists: false } })
        .skip(0)
        .limit(1000)
        .toArray();

      console.log({
        firstStock: getAllStocks[0].name,
        getAllStocksCount: getAllStocks.length,
      });

      const chunkUp = (array, size) => {
        const chunked_arr = [];
        let index = 0;
        while (index < array.length) {
          chunked_arr.push(array.slice(index, size + index));
          index += size;
        }
        return chunked_arr;
      };

      const stockBatches = chunkUp(getAllStocks, 10);

      console.log("stockBatches.length", stockBatches.length);

      const updatesIndustryStocks = await stockBatches.reduce(
        async (accUnresolved, stockBatch, i) => {
          const accResolved = await accUnresolved;

          await new Promise((t) => setTimeout(t, 2500));

          console.log("stockBatch: " + (i + 1) + " / " + stockBatches.length);

          const workingBatch = await Promise.all(
            stockBatch.map(async ({ code, exchange, EDOExchange, _id }, i) => {
              const getThisOne = await this.mongoDBStocksTable
                .find({
                  _id,
                })
                .toArray();

              if (getThisOne.length !== 0) {
                // console.log(
                //   "EXISTING: " + code + "." + exchange + " - " + EDOExchange
                // );

                if (getThisOne[0].code) {
                  const stock = await this.getStockByCode({
                    code: code + "." + EDOExchange,
                  }).catch((e) =>
                    console.log({ stock: code + "." + EDOExchange, e })
                  );

                  //   console.log({
                  //     k: code + "." + EDOExchange,
                  //     stock: stock.name
                  //   })

                  const updated = await this.mongoDBStocksTable.updateOne(
                    {
                      _id,
                    },
                    { $set: { ...stock } }
                  );

                  //   console.log("updated");
                  return (
                    "Updated: " + code + "." + exchange + " - " + EDOExchange
                  );
                } else {
                  const deleted = await this.mongoDBStocksTable.deleteOne({
                    _id: getThisOne[0]._id,
                  });
                  //   console.log("_id: " + getThisOne[0]._id);
                  return (
                    "Deleted: " + code + "." + exchange + " - " + EDOExchange
                  );
                }

                // return;
              } else {
                console.log("NOT PRESENT!! WAT??: " + code + "." + exchange);

                // const stock = await this.getStockByCode({
                //   code: code + "." + exchange,
                // });

                // if (Object.keys(stock).length && stock.code !== null) {
                //   const insertOne = await this.mongoDBStocksTable
                //     .insertOne(stock)
                //     .catch((err) => {
                //       console.log({ err });
                //     });

                //   console.log(
                //     "ADDED: " + code + "." + exchange + " | " + stock.exchange
                //   );
                // } else {
                //   console.log("NOPE: " + code + "." + exchange);
                // }

                return code + "." + exchange;
              }
            })
          );

          console.log(workingBatch);
        },
        []
      );

      return;
    };
  },
};
