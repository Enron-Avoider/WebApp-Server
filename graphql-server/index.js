const { ApolloServer } = require("apollo-server");
const redis = require("redis");

const { typeDefs } = require("./types");
const { MessyFinanceDataAPI, MessySectorsAndIndustries } = require("./data-sources");
const { stocks, query } = require("./resolvers");

const redisClient = redis.createClient({
  port: 13082,
  host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
  password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
});

const server = new ApolloServer({
  typeDefs,
  resolvers: {
      ...stocks,
      ...query
  },
  dataSources: () => ({
    messyFinanceDataAPI: new MessyFinanceDataAPI(redisClient),
    messySectorsAndIndustries: new MessySectorsAndIndustries(),
  }),
  context: async ({ req }) => ({
    redisClient,
  }),
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
