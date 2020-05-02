const { ApolloServer } = require("apollo-server");
const redis = require("redis");

const { resolvers, typeDefs } = require("./types");
const { MessyFinanceDataAPI } = require("./data-sources");

const redisClient = redis.createClient({
  port: 13082,
  host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
  password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    messyFinanceDataAPI: new MessyFinanceDataAPI(),
  }),
  context: async ({ req }) => ({
    redisClient,
  }),
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
