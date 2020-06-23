const fs = require("fs");
const numeral = require("numeral");
const { RESTDataSource } = require("apollo-datasource-rest");

const {
  financialTableMap,
  outstandingSharesTableMap,
  priceTableMap,
  isolateShares,
} = require("../dataMaps");

const STOCK_TO_SECTOR_FILE = "./state/data-sources/stockToSector.json";

module.exports = {
  MessySectorsAndIndustries: class extends RESTDataSource {
    constructor(redisClient) {
      super();

      this.redisClient = redisClient;
    }

    cached = async ({ cacheHash, Fn, save = true }) =>
      await new Promise((res, rej) => {
        // console.log({ cacheHash });
        return this.redisClient.get(cacheHash, async (err, reply) => {
          //   console.log({ err, reply });
          if (reply) {
            res(JSON.parse(reply));
          } else {
            const r = await Fn().catch((r, e) => null);
            // console.log({ r });
            if (save) {
              this.redisClient.set(cacheHash, JSON.stringify(r));
            }
            res(r);
          }
        });
      });

    getStockToSectorAndIndustryData = async () => {
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
            }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

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

    getSectorAndIndustryLinks = async () => {
      const Fn = async () =>
        (await this.getStockToSectorAndIndustryData()).stocks
          .reduce((acc, curr, i) => {
            const isExistingLink = (link, curr) =>
              link.source === curr.FinVizSector &&
              link.target === curr.FinVizIndustry;

            const existingLink =
              acc && acc.find((link) => isExistingLink(link, curr));

            return [
              ...(acc &&
                acc.map((link) =>
                  isExistingLink(link, curr)
                    ? {
                        ...link,
                        value: link.value + 1,
                      }
                    : link
                )),
              ...(!!!existingLink
                ? [
                    {
                      source: curr.FinVizSector,
                      target: curr.FinVizIndustry,
                      value: 1,
                    },
                  ]
                : []),
            ];
          }, [])
          .sort((a, b) => b.value - a.value);

      return this.cached({
        cacheHash: `/getSectorAndIndustryLinks`,
        Fn,
      });
    };

    getSectorAndIndustryForStock = async ({ ticker }) =>
      ((s) => ({
        sector: s.FinVizSector,
        industry: s.FinVizIndustry,
      }))(
        (await this.getStockToSectorAndIndustryData()).stocks.find(
          (s) => s.ticker === ticker
        )
      );

    getSector = async (name) => {
      const { analysis, stocks } = await this.getStockToSectorAndIndustryData();

      const sector = analysis.FinVizSector.find(
        (s) => Object.keys(s)[0] === name
      );

      const sectorStocks = stocks.filter(
        (s) => s.FinVizSector === Object.keys(sector)[0]
      );

      return sectorStocks;
    };

    getIndustry = async (name, dataSources) => {
      const Fn = async () => {
        const years = ((yearFrom = 2010) =>
          Array.from(
            { length: new Date().getFullYear() - yearFrom },
            (v, k) => yearFrom + k
          ))();

        const {
          analysis,
          stocks,
        } = await this.getStockToSectorAndIndustryData();

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
                  save: false,
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
                save: false,
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

      return this.cached({
        cacheHash: `/Industry/${name}`,
        Fn,
      });
    };

    getAllSectors = async () => {
      const data = await (await this.getStockToSectorAndIndustryData())
        .analysis;

      return data.FinVizSector.sort(
        (a, b) => Object.values(b)[0] - Object.values(a)[0]
      );
    };

    getAllIndustries = async () => {
      const data = await (await this.getStockToSectorAndIndustryData())
        .analysis;

      return data.FinVizIndustry.sort(
        (a, b) => Object.values(b)[0] - Object.values(a)[0]
      );
    };
  },
};
