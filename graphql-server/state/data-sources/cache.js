const { RESTDataSource } = require("apollo-datasource-rest");

module.exports = {
  MessyFinanceDataAPI: class extends RESTDataSource {
    constructor(redisClient) {
      super();

      this.redisClient = redisClient;

      this.keys = {
        //
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
  },
};
