const fs = require("fs");
const { RESTDataSource } = require("apollo-datasource-rest");

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

    getSectorAndIndustryForStock = (ticker) => [];

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

    getIndustry = async (name) => {
      const { analysis, stocks } = await this.getSimVizData();

      const industry = analysis.FinVizIndustry.find(
        (s) => Object.keys(s)[0] === name
      );

      const industryStocks = stocks.filter(
        (s) => s.FinVizIndustry === Object.keys(industry)[0]
      );

      return industryStocks;
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
