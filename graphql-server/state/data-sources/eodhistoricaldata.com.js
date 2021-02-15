const { RESTDataSource } = require("apollo-datasource-rest");
const parse = require("csv-parse");
const { ObjectId } = require('mongodb');

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

      this.mongoDBStocksTable = mongoDB.collection("Stocks");
    }

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
          progress: `${(i)} / ${(dupes.length)}`,
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
  },
};
