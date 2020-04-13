const { RESTDataSource } = require("apollo-datasource-rest");

module.exports = {
  MessyFinanceDataAPI: class extends RESTDataSource {
    constructor() {
      super();

      this.keys = {
        simfin: "QPUY3ma4Lj69NsEYCb3HNGfiQstUAhpJ",
      };
    }

    cached = async (redisClient, url, httpCall, body, differentiator) =>
      await new Promise((res, rej) => {
        const cacheHash = url + differentiator + JSON.stringify(body);
        //  console.log({ cacheHash });
        return redisClient.get(cacheHash, async (err, reply) => {
          //   console.log({ err, reply });
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

    findSimfinStockByName = async ({ name }, redisClient) =>
      this.cached(
        redisClient,
        `https://simfin.com/api/v1/info/find-id/name-search/${name}?api-key=${this.keys.simfin}`,
        "get"
      );

    findSimfinStockByTicker = async ({ name }, redisClient) =>
      this.cached(
        redisClient,
        `https://simfin.com/api/v1/info/find-id/ticker/${name}?api-key=${this.keys.simfin}`,
        "get"
      );

    getSimfinCompanyById = async ({ id }, redisClient) =>
      this.cached(
        redisClient,
        `https://simfin.com/api/v1/companies/id/${id}?api-key=${this.keys.simfin}`,
        "get"
      );

    getSimfinIndustryCompanies = async (id, redisClient) => {
      const firstRequest = await this.cached(
        redisClient,
        `https://simfin.com/api/v1/finder?api-key=${this.keys.simfin}`,
        "post",
        {
          search: [
            { indicatorId: "0-73", condition: { operator: "eq", value: id } },
          ],
        }
      );

      if (firstRequest.totalPages > 1) {
        const allPages = await [
          ...new Array(firstRequest.totalPages - 1),
        ].reduce(
          async (accUnresolved, curr, i) => {
            const accResolved = await accUnresolved;
            const nextPage = await this.cached(
              redisClient,
              `https://simfin.com/api/v1/finder?api-key=${this.keys.simfin}`,
              "post",
              {
                search: [
                  {
                    indicatorId: "0-73", // industry
                    condition: { operator: "eq", value: id },
                  },
                ],
                currentPage: i + 2,
              }
            );
            return [...accResolved, ...nextPage.results];
          },
          [...firstRequest.results]
        );
        return allPages;
      } else {
        return firstRequest.results;
      }
    };

    yearlyFinancials = async (id, redisClient) => {
      const years = ((yearFrom = 1990) =>
        Array.from(
          { length: new Date().getFullYear() - yearFrom + 1 },
          (v, k) => yearFrom + k
        ))();

      const statements = await ["pl", "bs", "cf"].reduce( async (accUnresolved, statement) => {
        const accResolved = await accUnresolved;
        return {
          ...accResolved,
          [statement]: await years.map(
            async (year) =>
              await this.cached(
                redisClient,
                `https://simfin.com/api/v1/companies/id/111052/statements/standardised
                      ?api-key=${this.keys.simfin}
                      &ptype=${"FY"}
                      &fyear=${year}
                      &stype=${statement}
                `.replace(/\s/g, ""),
                "get"
              ).then((r, e) => r && r.values)
          ),
        };
      }, {});

      return {
        years,
        ...statements,
      };
    };
  },
};
