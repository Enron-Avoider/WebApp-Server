const { RESTDataSource } = require("apollo-datasource-rest");

module.exports = {
  MessyFinanceDataAPI: class extends RESTDataSource {
    constructor() {
      super();

      this.keys = {
        simfin: "QPUY3ma4Lj69NsEYCb3HNGfiQstUAhpJ",
        iex: "pk_f98f7cd7f79646248c4ff291c23f1440",
      };
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

    getSimfinCompanyById = async ({ id }, redisClient) => ({
      ...(await this.cached(
        redisClient,
        `https://simfin.com/api/v1/companies/id/${id}?api-key=${this.keys.simfin}`,
        "get"
      )),
      years: ((yearFrom = 2010) =>
        Array.from(
          { length: new Date().getFullYear() - yearFrom + 1 },
          (v, k) => yearFrom + k
        ))(),
    });

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

    yearlyFinancials = async ({ years, simId }, redisClient) => {
      const transformToPerField = (statements) => {
        // gets all fields uniquely
        const fields = statements.reduce((acc, curr) => {
          const newFields = curr
            ? curr.reduce(
                (acc2, curr2) =>
                  !curr2 ||
                  (curr2.standardisedName &&
                    acc.find(
                      (el) => el.standardisedName === curr2.standardisedName
                    ))
                    ? acc2
                    : [...acc2, curr2],
                []
              )
            : [];
          return [...acc, ...newFields];
        }, []);
        //   .sort((a, b) => a.tid - b.tid || a.uid - b.uid);

        const perField = fields.map((field) => {
          const valuesOverArray = (key) =>
            statements
              .reduce(
                (acc, curr) =>
                  curr
                    ? [
                        ...acc,
                        curr.find(
                          (f) => f.standardisedName === field.standardisedName
                        )[key],
                      ]
                    : [...acc, 0],
                []
              )
              .map((v) => (!isNaN(+v) ? parseInt(v) : v));

          return {
            ...field,
            value: valuesOverArray("valueChosen"),
            // valueChosen: valuesOverArray("valueChosen"),
            // valueAssigned: valuesOverArray("valueAssigned"),
            // valueCalculated: valuesOverArray("valueCalculated"),
            // checkPossible: valuesOverArray("checkPossible"),
          };
        });

        return perField;
      };

      return await ["pl", "bs", "cf"].reduce(
        async (accUnresolved, statement) => {
          const accResolved = await accUnresolved;
          return {
            ...accResolved,
            [statement]: transformToPerField(
              await Promise.all(
                years.map(
                  async (year) =>
                    await this.cached(
                      redisClient,
                      `
                        https://simfin.com/api/v1/companies/id/${simId}/statements/standardised
                        ?api-key=${this.keys.simfin}
                        &ptype=${"FY"}
                        &fyear=${year}
                        &stype=${statement}
                     `.replace(/\s/g, ""),
                      "get"
                    ).then((r, e) => r && r.values)
                )
              )
            ),
          };
        },
        {}
      );
    };

    // yearlyPrices = async ({ years, ticker }, redisClient) => {
    //   return await Promise.all(
    //     years.map(
    //       async (y) =>
    //         await this.cached(
    //           redisClient,
    //           // quite disappointing data
    //           `https://cloud.iexapis.com/stable/stock/${ticker}/chart/date/${y}0930?chartByDay=true&token=${this.keys.iex}`,
    //           "get"
    //         )
    //     )
    //   );
    // };

    aggregatedShares = async ({ simId, years }, redisClient) =>
      await this.cached(
        redisClient,
        `https://simfin.com/api/v1/companies/id/${simId}/shares/aggregated?api-key=${this.keys.simfin}`,
        "get",
      ).then((r) => {
          
        // return r.sort((a, b) => a.date - b.date)
        return r;
      })

    shareClasses = async ({ simId, years }, redisClient) =>
      (
        await this.cached(
          redisClient,
          `https://simfin.com/api/v1/companies/id/${simId}/shares/classes/list?api-key=${this.keys.simfin}`,
          "get"
        )
      ).map((c) => ({
        simId,
        years,
        ...c,
      }));

    pricesForShareClasses = async (
      { simId, shareClassId, years },
      redisClient
    ) =>
      this.cached(
        redisClient,
        `https://simfin.com/api/v1/companies/id/${simId}/shares/classes/${shareClassId}/prices?api-key=${this.keys.simfin}`,
        "get"
      ).then((r) => ({
        ...r,
        priceData: years.map(
          (y) =>
            r &&
            r.priceData
              .sort((a, b) => a.date - b.date)
              .find((p) => p.date.includes(`${y}-09-2`))
        ),
      }));
  },
};
