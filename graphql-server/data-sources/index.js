const { RESTDataSource } = require("apollo-datasource-rest");

module.exports = {
  MoviesAPI: class extends RESTDataSource {
    constructor() {
      super();
      this.baseURL_ = "http://localhost:5000";
    }

    cached = async (redisClient, url, differentiator) =>
      await new Promise((res, rej) =>
        redisClient.get(url+differentiator, async (err, reply) => {
          if (reply) {
            res(JSON.parse(reply));
          } else {
            const apiRes = await this.get(url);
            redisClient.set(url+differentiator, JSON.stringify(apiRes));
            res(apiRes);
          }
        })
      );

    getMovie = async (params, redisClient) => {
      const url = `${this.baseURL_}/movie`;
      return this.cached(redisClient, url, "hum");
    };

    getBook = async (id, redisClient) => {
      const url = `${this.baseURL_}/book`;
      return this.cached(redisClient, url, "hum2");
    };
  },
};
