const { RESTDataSource } = require("apollo-datasource-rest");
const parse = require("csv-parse");

const { EODDataMaps } = require("../data-maps");
const mathToMongo = require("../utils/mathToMongo");
const chunkUp = require("../utils/chunkUp");

module.exports = {
  EODDataAPI: class extends RESTDataSource {
    constructor(mongoDB) {
      super();

      this.keys = {
        eodhistoricaldata: "5f80d8849f6b13.09550863",
        googlePlaces: "AIzaSyAMIu4lJGH969CHlLdKj3Uc_AMoUntOWsM",
      };

      this.mongoDBStocksTable = mongoDB.collection("tests");
      this.mongoDBIndustriesTable = mongoDB.collection("Industries");
      this.mongoDBStocksTable = mongoDB.collection("Stocks");
      this.mongoDBExchangesTable = mongoDB.collection("Exchanges");
    }

    searchStocks = async ({ name }) => {
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

    getStockByCode = async ({ code }) => {
      const fundamentalData = await this.get(
        `
          https://eodhistoricaldata.com/api/fundamentals/${code}?
            api_token=${this.keys.eodhistoricaldata}
        `.replace(/\s/g, "")
      );

      const is_in_exchange_country =
        fundamentalData.General &&
        (await (async () => {
          const AddressGoogleCountry = await this.get(
            `https://maps.googleapis.com/maps/api/geocode/json?&address=${encodeURIComponent(
              fundamentalData.General.Address
            )}&key=${this.keys.googlePlaces}`
          );

          const CountryGoogleCountry = await this.get(
            `https://maps.googleapis.com/maps/api/geocode/json?&address=${fundamentalData.General.CountryName}&key=${this.keys.googlePlaces}`
          );

          if (
            AddressGoogleCountry.results &&
            CountryGoogleCountry.results &&
            AddressGoogleCountry.results[0] &&
            CountryGoogleCountry.results[0] &&
            AddressGoogleCountry.results[0].address_components.find((c) =>
              c.types.includes("country")
            )
          ) {
            return (
              AddressGoogleCountry.results[0].address_components.find((c) =>
                c.types.includes("country")
              ).short_name ===
              CountryGoogleCountry.results[0].address_components.find((c) =>
                c.types.includes("country")
              ).short_name
            );
          } else {
            return false;
          }
        })());

      const priceData = await this.get(
        `
            https://eodhistoricaldata.com/api/eod/${code}?
                period=m&
                fmt=json&
                api_token=${this.keys.eodhistoricaldata}
        `
      );

      const fundamentalsCurrency =
        fundamentalData.Financials &&
        fundamentalData.Financials.Balance_Sheet.currency_symbol;

      const yearlyCurrencyPairs =
        fundamentalsCurrency &&
        (await this.getCurrencyToCurrencyTimeseries({
          currency: fundamentalsCurrency,
          toCurrency: "USD",
        }).catch((e) => null));

      // EODFundamentals > yearlyFinancials
      const yearlyFinancials =
        Object.keys(fundamentalData).length &&
        fundamentalData.Highlights &&
        yearlyCurrencyPairs &&
        EODDataMaps.convertEODFundamentalsToEarlyFinancials(
          fundamentalData,
          priceData,
          yearlyCurrencyPairs
        );

      // yearlyFinancials > yearlyFinancialsWithKeys
      const yearlyFinancialsWithKeys =
        yearlyFinancials &&
        EODDataMaps.yearlyFinancialsWithKeys(yearlyFinancials);

      // yearlyFinancialsWithKeys > yearlyFinancialsByYear
      const yearlyFinancialsByYear =
        yearlyFinancialsWithKeys &&
        EODDataMaps.yearlyFinancialsFlatByYear(yearlyFinancialsWithKeys);

      // TODO (maybe could  simplify)
      // EODFundamentals > yearlyFinancialsByYear
      // yearlyFinancialsByYear > yearlyFinancialsWithKeys

      return Object.keys(fundamentalData).length && fundamentalData.Highlights
        ? {
            code: fundamentalData.General.Code,
            name: fundamentalData.General.Name,
            country: fundamentalData.General.CountryName,
            exchange: fundamentalData.General.Exchange,
            EODExchange:
              fundamentalData.General.CountryISO === "US"
                ? "US"
                : fundamentalData.General.Exchange,
            currency_symbol: fundamentalData.General.CurrencySymbol,
            currency_code: fundamentalData.General.CurrencyCode,
            fundamentalsCurrency,
            finalCurrency: "USD",
            yearlyCurrencyPairs:
              yearlyCurrencyPairs && yearlyCurrencyPairs.perYear,
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
            yearlyFinancialsByYear,
            retrieved_at: Date.now(),
            is_in_exchange_country,
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
                ...calcs_.reduce(
                  (p, { fieldName, calc, paths }) => ({
                    ...p,
                    [`calc_${fieldName}`]: [
                      {
                        $project: {
                          name: 1,
                          "yearlyFinancialsByYear.year": 1,
                          [`calc_${fieldName}`]: 1,
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
        ...(calcs && { calcRows: (await calcRows())[0] }),
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

    getExchangeStocks = async ({ code }) => {
      const exchangeStocksCSV = await this.get(
        `https://eodhistoricaldata.com/api/exchange-symbol-list/${code}?api_token=${this.keys.eodhistoricaldata}`
      );

      const exchangeStocksJSON = (
        await new Promise((r) =>
          parse(
            exchangeStocksCSV,
            {
              columns: true,
              trim: true,
              skip_lines_with_error: true,
            },
            (err, output) => {
              if (err) console.log({ err });
              r(output);
            }
          )
        )
      )
        .map((s) => ({
          ...s,
          EODExchange: code, // we must replace exchange because EOD uses `US` for all US Exchanges
        }))
        .filter((s) => s.Type === "Common Stock");

      return {
        count: exchangeStocksJSON.length,
        stocks: exchangeStocksJSON,
      };
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

    getCurrencyToCurrencyTimeseries = async ({ currency, toCurrency }) => {
      const getCurrencyToCurrencyTimeseries = await this.get(
        `
            https://eodhistoricaldata.com/api/eod/${currency}${toCurrency}.FOREX?
                fmt=json&
                api_token=${this.keys.eodhistoricaldata}
        `
      );

      const perYear = getCurrencyToCurrencyTimeseries.reduce(
        (p, c) => ({ ...p, [c.date.substring(0, 4)]: c.close }),
        {}
      );

      return {
        query: {
          currency,
          toCurrency,
        },
        perYear,
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
              1
          ) {
            return "Skipped [Updated < 1 day ago]: " + Code + "." + Exchange;
          }

          //   console.log(`${Code}.${Exchange}`);

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
          } else {
            const inserted = await this.mongoDBStocksTable.insertOne(stock);
            return "Created: " + Code + "." + Exchange + "." + EODExchange;
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
  },
};
