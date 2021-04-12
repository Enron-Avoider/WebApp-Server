const { RESTDataSource } = require("apollo-datasource-rest");
const parse = require("csv-parse");
const { ObjectId } = require("mongodb");
const regionNamesInEnglish = new Intl.DisplayNames(["en"], { type: "region" });
const fs = require("fs");
const fetch = require("node-fetch");

const { EODDataMaps } = require("../data-maps");
const mathToMongo = require("../utils/mathToMongo");
const chunkUp = require("../utils/chunkUp");

module.exports = {
  EODDataAPI: class extends RESTDataSource {
    constructor(mongoDB, s3) {
      super();

      this.keys = {
        eodhistoricaldata: "5f80d8849f6b13.09550863",
        // googlePlaces: "AIzaSyAMIu4lJGH969CHlLdKj3Uc_AMoUntOWsM",
      };

      this.mongoDBStocksTable = mongoDB.collection("Stocks");
      this.s3 = s3;
    }

    getStockByCode = async ({ code }, dataSources) => {
      const fundamentalData = await this.get(
        `
          https://eodhistoricaldata.com/api/fundamentals/${code}?
            api_token=${this.keys.eodhistoricaldata}
        `.replace(/\s/g, "")
      );

      const is_in_exchange_country =
        fundamentalData.General &&
        fundamentalData.General.Address &&
        fundamentalData.General.CountryISO &&
        fundamentalData.General.Address.toLowerCase().includes(
          regionNamesInEnglish
            .of(fundamentalData.General.CountryISO)
            .toLowerCase()
        );

      const priceData =
        is_in_exchange_country &&
        (await this.get(
          `
            https://eodhistoricaldata.com/api/eod/${code}?
                period=m&
                fmt=json&
                api_token=${this.keys.eodhistoricaldata}
        `
        ));

      const fundamentalsCurrency =
        fundamentalData.Financials &&
        fundamentalData.Financials.Balance_Sheet.currency_symbol;

      const priceCurrency =
        fundamentalData.General && fundamentalData.General.CurrencyCode;

      console.log({
        fundamentalsCurrency,
        priceCurrency,
      });

      const yearlyCurrencyPairsForFundamental =
        is_in_exchange_country &&
        fundamentalsCurrency &&
        (await dataSources.Ours.getAggregationThroughCacheIfPossible({
          cacheQuery: {
            type: "yearlyCurrencyPair",
            currency: fundamentalsCurrency,
            toCurrency: "USD",
          },
          getUncachedAggregationFn: this.getCurrencyToCurrencyTimeseries,
          getUncachedAggregationParameters: {
            currency: fundamentalsCurrency,
            toCurrency: "USD",
          },
        }));

      const yearlyCurrencyPairsForPrice =
        is_in_exchange_country &&
        priceCurrency &&
        (await dataSources.Ours.getAggregationThroughCacheIfPossible({
          cacheQuery: {
            type: "yearlyCurrencyPair",
            currency: priceCurrency,
            toCurrency: "USD",
          },
          getUncachedAggregationFn: this.getCurrencyToCurrencyTimeseries,
          getUncachedAggregationParameters: {
            currency: priceCurrency,
            toCurrency: "USD",
          },
        }));

      // EODFundamentals > yearlyFinancials
      const yearlyFinancials =
        is_in_exchange_country &&
        Object.keys(fundamentalData).length &&
        fundamentalData.Highlights &&
        yearlyCurrencyPairsForFundamental &&
        EODDataMaps.convertEODFundamentalsToEarlyFinancials(
          fundamentalData,
          priceData,
          yearlyCurrencyPairsForFundamental,
          yearlyCurrencyPairsForPrice
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

      const getUploadedImg = async (logoUrl) => {
        const logoMimeType = logoUrl.split(/\.(?=[^\.]+$)/)[1];

        const existingUpload = await fetch(
          `http://enronavoider-logos.s3.amazonaws.com/${fundamentalData.General.Code}.${logoMimeType}`
        ).then((r) =>
          r.status === 200
            ? `enronavoider-logos.s3.amazonaws.com/${fundamentalData.General.Code}.${logoMimeType}`
            : false
        );

        return (
          existingUpload ||
          (await fetch(`http://${logoUrl}`)
            .then((res) => {
              return this.s3
                .upload({
                  Bucket: "enronavoider-logos",
                  Key: `${fundamentalData.General.Code}.${logoMimeType}`,
                  Body: res.body,
                })
                .promise();
            })
            .then((res) => {
              return res.Location.replace("https://", "");
            })
            .catch((err) => {
              return null;
            }))
        );
      };

      const logoUrl = fundamentalData.General.LogoURL
        ? getUploadedImg(
            "eodhistoricaldata.com" + fundamentalData.General.LogoURL
          )
        : null;

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
            yearlyCurrencyPairsForFundamental:
              yearlyCurrencyPairsForFundamental &&
              yearlyCurrencyPairsForFundamental.perYear,
            yearlyCurrencyPairsForPrice:
              yearlyCurrencyPairsForPrice &&
              yearlyCurrencyPairsForPrice.perYear,
            market_capitalization:
              fundamentalData.Highlights.MarketCapitalization,
            sector: fundamentalData.General.Sector,
            industry: fundamentalData.General.Industry,
            description: fundamentalData.General.Description,
            logo: logoUrl,
            yearlyFinancials,
            yearlyFinancialsWithKeys,
            yearlyFinancialsByYear,
            retrieved_at: Date.now(),
            is_in_exchange_country,
            // has_biggest_last_year_market_cap
          }
        : {};
    };

    getAllExchanges = async () => {
      return await this.get(`
        https://eodhistoricaldata.com/api/exchanges-list/?api_token=${this.keys.eodhistoricaldata}
      `);
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

    getCurrencyToCurrencyTimeseries = async ({ currency, toCurrency }) => {
      const areCurrenciesSame = currency === toCurrency;

      const isGBX = currency === "GBX";

      console.log({ currency, toCurrency, isGBX });

      const getCurrencyToCurrencyTimeseries =
        !areCurrenciesSame &&
        (await this.get(
          `
            https://eodhistoricaldata.com/api/eod/${
              isGBX ? "GBP" : currency
            }${toCurrency}.FOREX?
                fmt=json&
                api_token=${this.keys.eodhistoricaldata}
        `
        ));

      const perYear = !areCurrenciesSame
        ? getCurrencyToCurrencyTimeseries.reduce(
            (p, c) => ({
              ...p,
              [c.date.substring(0, 4)]: isGBX ? c.close / 100 : c.close,
            }),
            {}
          )
        : Array(45)
            .fill(null)
            .map((_, i) => 1980 + i)
            .reduce((p, c) => ({ ...p, [c]: 1 }), {});

      return {
        query: {
          currency,
          toCurrency,
        },
        perYear,
      };
    };

    saveBatchOfStocksToDB = async ({ stockBatch }, dataSources) => {
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

          const stock = await this.getStockByCode(
            {
              code: Code + "." + EODExchange,
            },
            dataSources
          )
            .then((s) => ({
              ...s,
              ...(!s.is_in_exchange_country && {
                yearlyFinancials: null,
                yearlyFinancialsWithKeys: null,
                yearlyFinancialsByYear: null,
              }),
            }))
            .catch((e) => {
              console.log("Failed_: " + Code + "." + EODExchange, !!stockInDB);
              return {};
            });

          // console.log(`${Code}.${Exchange} ${!!stockInDB} ${stock.is_in_exchange_country}`);

          if (!!stockInDB && stock.code) {
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

    updateStocksCompletely = async ({ userId }, dataSources) => {
      const isAdmin = await dataSources.Ours.isAdmin({ id: userId });

      if (isAdmin) {
        // get exchanges
        const ExchangesFromEODAPI = await this.getAllExchanges();
        // get exchange Stock codes
        const loopThroughExchangesOneByOne = await ExchangesFromEODAPI.reduce(
          async (accUnresolved, exchange, j) => {
            const accResolved = await accUnresolved;

            //   console.log(`working on exchange`, { exchange: exchange.Name });

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

                //   await new Promise((t) => setTimeout(t, 100));
                const savedStocks = await this.saveBatchOfStocksToDB(
                  {
                    stockBatch,
                  },
                  dataSources
                );

                const onlySkippedStocks =
                  savedStocks.reduce(
                    (p, c) => (c.includes("Skipped") ? p + 1 : p),
                    0
                  ) === 10;

                const onlyFailedStocks =
                  savedStocks.reduce(
                    (p, c) => (c.includes("Failed") ? p + 1 : p),
                    0
                  ) === 10;

                await new Promise((t) =>
                  setTimeout(
                    t,
                    onlyFailedStocks
                      ? 24.1 * 60 * 60 * 1000
                      : onlySkippedStocks
                      ? 10
                      : 100
                  )
                );

                console.log({
                  onlySkippedStocks,
                  exchange: `${exchange.Name} - ${exchange.Code}`,
                  totalProgress: `${(
                    (j / ExchangesFromEODAPI.length) *
                    100
                  ).toFixed(2)}%`,
                  exchangeProgress: `${(
                    (i / exchangeStockBatches.length) *
                    100
                  ).toFixed(2)}%`,
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
      } else {
        return null;
      }
    };
  },
};
