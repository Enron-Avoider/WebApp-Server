const { RESTDataSource } = require("apollo-datasource-rest");
const {
  financialTableMap,
  outstandingSharesTableMap,
  priceTableMap,
  isolateShares,
} = require("../dataMaps");

module.exports = {
  MessyFinanceDataAPI: class extends RESTDataSource {
    constructor(redisClient) {
      super();

      this.redisClient = redisClient;

      this.keys = {
        simfin: "QPUY3ma4Lj69NsEYCb3HNGfiQstUAhpJ",
        iex: "pk_f98f7cd7f79646248c4ff291c23f1440",
      };
    }

    cachedCall = async ({ url, httpCall, body, differentiator, save = true }) =>
      await new Promise((res, rej) => {
        const cacheHash = url + differentiator + JSON.stringify(body);
        // console.log({ cacheHash });
        return this.redisClient.get(cacheHash, async (err, reply) => {
          // console.log({ err, reply });
          if (reply) {
            res(JSON.parse(reply));
          } else {
            // console.log({ url, body });
            const apiRes = await this[httpCall](url, body).catch(
              (r, e) => null
            );
            // console.log({ apiRes });
            if (save) {
              this.redisClient.set(cacheHash, JSON.stringify(apiRes));
            }
            res(apiRes);
          }
        });
      });

    cachedFn = async ({ cacheHash, Fn, save = true }) =>
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

    findSimfinStockByName = async ({ name }) =>
      this.cachedCall({
        url: `https://simfin.com/api/v1/info/find-id/name-search/${name.replace(
          /[^\w\s]/gi,
          ""
        )}?api-key=${this.keys.simfin}`,
        httpCall: "get",
      });

    findSimfinStockByTicker = async ({ name, save = true }) =>
      this.cachedCall({
        url: `https://simfin.com/api/v1/info/find-id/ticker/${name}?api-key=${this.keys.simfin}`,
        httpCall: "get",
        save
      });

    getSimfinCompanyById = async ({ id }) => ({
      ...(await this.cachedCall({
        url: `https://simfin.com/api/v1/companies/id/${id}?api-key=${this.keys.simfin}`,
        httpCall: "get",
      })),
      years: ((yearFrom = 2010) =>
        Array.from(
          { length: new Date().getFullYear() - yearFrom },
          (v, k) => yearFrom + k
        ))(),
    });

    getSimfinIndustryCompanies = async (id) => {
      const firstRequest = await this.cachedCall({
        url: `https://simfin.com/api/v1/finder?api-key=${this.keys.simfin}`,
        httpCall: "post",
        body: {
          search: [
            { indicatorId: "0-73", condition: { operator: "eq", value: id } },
          ],
        },
      });

      if (firstRequest.totalPages > 1) {
        const allPages = await [
          ...new Array(firstRequest.totalPages - 1),
        ].reduce(
          async (accUnresolved, curr, i) => {
            const accResolved = await accUnresolved;
            const nextPage = await this.cachedCall({
              url: `https://simfin.com/api/v1/finder?api-key=${this.keys.simfin}`,
              httpCall: "post",
              body: {
                search: [
                  {
                    indicatorId: "0-73", // industry
                    condition: { operator: "eq", value: id },
                  },
                ],
                currentPage: i + 2,
              },
            });
            return [...accResolved, ...nextPage.results];
          },
          [...firstRequest.results]
        );
        return allPages;
      } else {
        return firstRequest.results;
      }
    };

    yearlyFinancials = async ({ years, simId, save = false }) => {
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
                    await this.cachedCall({
                      url: `
                                https://simfin.com/api/v1/companies/id/${simId}/statements/standardised
                                ?api-key=${this.keys.simfin}
                                &ptype=${"FY"}
                                &fyear=${year}
                                &stype=${statement}
                            `.replace(/\s/g, ""),
                      httpCall: "get",
                      save
                    }).then((r, e) => r && r.values)
                )
              )
            ),
          };
        },
        {}
      );
    };

    aggregatedShares = async ({ simId, years, save = false }) =>
      await this.cachedCall({
        url: `https://simfin.com/api/v1/companies/id/${simId}/shares/aggregated?api-key=${this.keys.simfin}`,
        httpCall: "get",
        save
      }).then((r) => {
        // return r.sort((a, b) => a.date - b.date)
        return r;
      });

    shareClasses = async ({ simId, years }) =>
      (
        await this.cachedCall({
          url: `https://simfin.com/api/v1/companies/id/${simId}/shares/classes/list?api-key=${this.keys.simfin}`,
          httpCall: "get",
        })
      ).map((c) => ({
        simId,
        years,
        ...c,
      }));

    pricesForShareClasses = async ({ simId, shareClassId, years, save = false }) =>
      this.cachedCall({
        url: `https://simfin.com/api/v1/companies/id/${simId}/shares/classes/${shareClassId}/prices?api-key=${this.keys.simfin}`,
        httpCall: "get",
        save
      }).then((r) => ({
        ...r,
        priceData: years.map(
          (y) =>
            r &&
            r.priceData
              .sort((a, b) => a.date - b.date)
              .find((p) => p.date.includes(`${y}-09-2`))
        ),
      }));
    logo = async ({ ticker }) =>
      this.cachedCall({
        url: `https://cloud.iexapis.com/stable/stock/${ticker}/logo?token=${this.keys.iex}`,
        httpCall: "get",
      });

    allYearlyFinancials = async ({ years, simId }) => {
      const Fn = async () => ({
        years: years,
        ...financialTableMap(
          years,
          await this.yearlyFinancials({ years, simId })
        ),
        aggregatedShares: outstandingSharesTableMap(
          years,
          await this.aggregatedShares({ years, simId })
        ),
        price: await (async (shareClasses) =>
          await [
            priceTableMap(
              years,
              "price",
              await this.pricesForShareClasses({
                simId: simId,
                shareClassId: shareClasses[0].shareClassId,
                years: years,
              })
            ),
          ])(await this.shareClasses({ years, simId })),
      });

      return this.cachedFn({
        cacheHash: `/allYearlyFinancials/${simId}`,
        Fn,
      });
    };
  },
};
