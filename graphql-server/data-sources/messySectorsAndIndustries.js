const fs = require("fs");
const numeral = require("numeral");
const { RESTDataSource } = require("apollo-datasource-rest");

const {
  financialTableMap,
  outstandingSharesTableMap,
  priceTableMap,
  isolateShares,
} = require("../dataMaps");

const STOCK_TO_SECTOR_FILE = "./data-sources/stockToSector.json";

module.exports = {
  MessySectorsAndIndustries: class extends RESTDataSource {
    constructor() {
      super();
    }

    cached = async (redisClient, url, httpCall, body, differentiator) =>
      await new Promise((res, rej) => {
        const cacheHash = url + differentiator + JSON.stringify(body);
        // console.log({ cacheHash });
        return redisClient.get(cacheHash, async (err, reply) => {
          // console.log({ err, reply });
          if (reply) {
            res(JSON.parse(reply));
          } else {
            // console.log({ url, body });
            const apiRes = await this[httpCall](url, body).catch(
              (r, e) => null
            );
            // console.log({ apiRes });
            redisClient.set(cacheHash, JSON.stringify(apiRes));
            res(apiRes);
          }
        });
      });

    getSimVizData = async () => {
      const stocks = (
        await new Promise((resolve, reject) => {
          fs.readFile(STOCK_TO_SECTOR_FILE, "utf8", (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
          });
        })
      ).filter((s) => s.ticker !== null);

      const isolateAttributes = (array) => {
        const explore = (name, array) =>
          array
            .reduce(
              (acc, curr, i) => [
                ...acc,
                ...(curr[name] && !acc.find((s) => s === curr[name])
                  ? [curr[name]]
                  : []),
              ],
              []
            )
            .map((n) => ({
              [n]: array.filter((s) => s[name] === n).length,
            }));

        return {
          sector: explore("sector", array),
          FinVizSector: explore("FinVizSector", array),
          FinVizIndustry: explore("FinVizIndustry", array),
          FinVizCountry: explore("FinVizCountry", array),
        };
      };

      return {
        stocks,
        analysis: isolateAttributes(stocks),
      };
    };

    getSectorAndIndustryForStock = async ({ ticker }) => 
        (s => ({
            sector: s.FinVizSector,
            industry: s.FinVizIndustry
        }))
        (
            (await this.getSimVizData())
                .stocks
                .find(s => s.ticker === ticker)
        );

    getSector = async (name) => {
      const { analysis, stocks } = await this.getSimVizData();

      const sector = analysis.FinVizSector.find(
        (s) => Object.keys(s)[0] === name
      );

      const sectorStocks = stocks.filter(
        (s) => s.FinVizSector === Object.keys(sector)[0]
      );

      return sectorStocks;
    };

    getIndustry = async (name, dataSources) => {
      // if cached

      // else

      const years = ((yearFrom = 2010) =>
        Array.from(
          { length: new Date().getFullYear() - yearFrom },
          (v, k) => yearFrom + k
        ))();

      const { analysis, stocks } = await this.getSimVizData();

      const industry = analysis.FinVizIndustry.find(
        (s) => Object.keys(s)[0] === name
      );

      const stocksWithSimId = await Promise.all(
        stocks
          .filter((s) => s.FinVizIndustry === Object.keys(industry)[0])
          .map(async (s) => {
            const stock = (
              await dataSources.messyFinanceDataAPI.findSimfinStockByTicker({
                name: s.ticker,
              })
            )[0];
            return {
              ...s,
              simId: stock.simId,
            };
          })
      );

      const stocksWithFinancialData = await Promise.all(
        stocksWithSimId.map(async (s) => {
          const financialData = await financialTableMap(
            years,
            await dataSources.messyFinanceDataAPI.yearlyFinancials({
              years,
              simId: s.simId,
            })
          );
          return {
            ...s,
            financialData,
          };
        })
      );

      const calc = ["pl", "bs", "cf"].reduce((a, t) => {
        const rows = stocksWithFinancialData.reduce((acc, s, i) => {
          const rows = s.financialData[t].map((f) => f.title);
          return [...new Set([...acc, ...rows])];
        }, []);

        return {
          ...a,
          years,
          [t]: rows.map((r) =>
            years.reduce(
              (a_, y) => {
                const yearCalc = stocksWithFinancialData.reduce((a__, s) => {
                  const v = s.financialData[t].find((r_) => r_.title === r)
                    ? s.financialData[t].find((r_) => r_.title === r)[y]
                    : 0;
                  return a__ + numeral(v).value();
                }, 0);

                return {
                  ...a_,
                  [y]: yearCalc,
                };
              },
              { title: r }
            )
          ),
        };
      }, {});

      return {
        name,
        companies: stocksWithSimId,
        yearlyFinancialsAddedUp: {
          years,
          ...calc,
        },
      };
    };

    getAllSectors = async () => {
      const data = await (await this.getSimVizData()).analysis;

      return data.FinVizIndustry.sort(
        (a, b) => Object.values(b)[0] - Object.values(a)[0]
      );
    };

    getAllIndustries = async () => {
      const data = await (await this.getSimVizData()).analysis;

      return data.FinVizIndustry.sort(
        (a, b) => Object.values(b)[0] - Object.values(a)[0]
      );
    };
  },
};
