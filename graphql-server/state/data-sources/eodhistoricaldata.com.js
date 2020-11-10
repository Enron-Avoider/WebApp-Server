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
            yearlyFinancials: EODDataMaps.convertEODFundamentalsToEarlyFinancials(
              fundamentalData,
              priceData
            ),
          }
        : {};
    };

    getSectorStocks = async ({ name }) => {
        const stocks = await this.mongoDBStocksTable.find({
            sector: name
        }).toArray();

        return {
            stocks
        }
    };

    getIndustryStocks = async ({ sector, industry, country, exchange  }) => {
        const stocks = await this.mongoDBStocksTable.find({
            ...(sector && { sector }),
            ...(industry && { industry }),
            ...(country && { country }),
            ...(exchange && { exchange }),
        }).toArray();

        // for every row/calc
        //  - avg
        //  - median
        //  - max
        //  - min
        //  - normal distribution
        //  - percentils

        // countries | exchanges | sectors > industries || rows&calcs | period
        //    -- percentils/normal distribution --      ||
        //           stock value | history?             ||

        return {
            name,
            stocks,
            exchanges,
            countries,
            sectors,
            industries,
            yearlyFinancials
        }
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
        .find({ "yearlyFinancials.pl": null })
        .toArray();
      console.log({
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

      const stockBatches = chunkUp(getAllStocks, 15);

      console.log("stockBatches.length", stockBatches.length);

      const updatesIndustryStocks = await stockBatches.reduce(
        async (accUnresolved, stockBatch, i) => {
          const accResolved = await accUnresolved;

          await new Promise((t) => setTimeout(t, 500));

          console.log("stockBatch.length: " + stockBatch.length);

          const workingBatch = await Promise.all(
            stockBatch.map(async ({ code, exchange, EDOExchange, _id }, i) => {
              const getThisOne = await this.mongoDBStocksTable
                .find({
                  _id
                })
                .toArray();

              if (getThisOne.length !== 0) {
                console.log(
                  "EXISTING: " + code + "." + exchange + " - " + EDOExchange
                );

                if (getThisOne[0].code) {
                  const stock = await this.getStockByCode({
                    code: code + "." + EDOExchange,
                  });

                  const updated = await this.mongoDBStocksTable.updateOne(
                    {
                        _id
                    },
                    { $set: { ...stock } }
                  );

                  console.log("updated");
                } else {
                  const deleted = await this.mongoDBStocksTable.deleteOne({
                    _id: getThisOne[0]._id,
                  });
                  console.log("_id: " + getThisOne[0]._id);
                }

                return;
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
        },
        []
      );

      return;
    };
  },
};
