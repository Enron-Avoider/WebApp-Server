const { RESTDataSource } = require("apollo-datasource-rest");
const parse = require("csv-parse");

const { EODDataMaps } = require("../data-maps");

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

      console.log({ fundamentalData });

      return (Object.keys(fundamentalData).length && fundamentalData.Highlights)
        ? {
            code: fundamentalData.General.Code,
            name: fundamentalData.General.Name,
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
            yearlyFinancials: EODDataMaps.convertEODFundamentalsToEarlyFinancials(
              fundamentalData,
              priceData
            ),
          }
        : {};
    };

    getSectorStocks = async ({ name }) => {
      const insert = await this.mongoDBStocksTable.insertMany([{ a: 1 }]);
      const getAll = await this.mongoDBStocksTable.find({}).toArray();
      const deleteAll = await Promise.all(
        getAll.map(async (obj) => this.mongoDBStocksTable.deleteOne(obj))
      );
      console.log({ insert, getAll, deleteAll });

      const recurse = async (res, offset) => {
        const call = await this.get(
          "".concat(
            "https://eodhistoricaldata.com/api/screener?",
            `filters=[["sector", "=", "${name}"], ["exchange", "=", "US"]]&`,
            `api_token=${this.keys.eodhistoricaldata}&`,
            `sort=market_capitalization.desc&`,
            `&offset=${offset}`
          )
        );

        const r = [...res, ...call.data];

        console.log({ offset, l: r.length });

        if (call.data.length === 0) {
          return r;
        } else {
          return await recurse(r, offset + 50);
        }
      };
      //   const res = await this.get(
      //     "".concat(
      //       "https://eodhistoricaldata.com/api/screener?",
      //       `filters=[["sector", "=", "${name}"]]&`,
      //       `api_token=${this.keys.eodhistoricaldata}&`,
      //       `sort=market_capitalization.desc&`,
      //       `&offset=50`
      //     )
      //   );
      //   console.log({ l: res.data.length });
      return await recurse([], 0);
    };

    getIndustryStocks = async ({ name }) => {
      const recurse = async (res, offset) => {
        const call = await this.get(
          "".concat(
            "https://eodhistoricaldata.com/api/screener?",
            `filters=[["industry", "=", "${name}"]]&`,
            `api_token=${this.keys.eodhistoricaldata}&`,
            `sort=market_capitalization.desc&`,
            `&offset=${offset}&limit=100`
          )
        );

        const r = [...res, ...call.data];

        if (call.data.length < 100 || offset === 900) {
          return r;
        } else {
          return await recurse(r, offset + 100);
        }
      };

      return await recurse([], 0);
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

          const savedIndustryStocks = await stocks.reduce(
            async (accUnresolved, { code, exchange, industry }, i) => {
              const accResolved = await accUnresolved;

              await new Promise((t) => setTimeout(t, 5));

              const getThisOne = await this.mongoDBStocksTable
                .find({
                  code,
                  EDOExchange: exchange,
                })
                .toArray();

              if (getThisOne.length !== 0) {
                console.log("EXISTING: " + code + "." + exchange);
                return [...accResolved];
              } else {
                console.log("ADDING: " + code + "." + exchange);

                const stock = await this.getStockByCode({
                  code: code + "." + exchange,
                });

                const insertOne = await this.mongoDBStocksTable.insertOne(
                  stock
                );

                console.log(
                  "ADDED: " + code + "." + exchange + " | " + stock.exchange
                );

                return [...accResolved, code + "." + exchange];
              }
            },
            []
          );

          return [
            ...accResolved,
            {
              industry,
              stocks: stocks.length,
            },
          ];
        },
        []
      );

      return saved;
    };
  },
};
