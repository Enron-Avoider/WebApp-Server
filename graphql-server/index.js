const { ApolloServer } = require("apollo-server");
const redis = require("redis");
const { Pool, Client } = require("pg");

const { typeDefs } = require("./state/types");
const {
  MessyFinanceDataAPI,
  MessySectorsAndIndustries,
} = require("./state/data-sources");
const { stocks, query, mutation } = require("./state/resolvers");

// const pgClient = new Client({
//   user: "enron",
//   host: "enron.cunygjbp6jr0.us-east-1.rds.amazonaws.com",
//   database: "enron",
//   password: "enronenron",
//   port: 5432,
// });
// pgClient.connect();
// pgClient.query("SELECT NOW()", (err, res) => {
//   console.log(err, res);
//   pgClient.end();
// });

const redisClient = redis.createClient({
  port: 13082,
  host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
  password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
});

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    ...stocks,
    ...query,
    ...mutation,
  },
  dataSources: () => ({
    messyFinanceDataAPI: new MessyFinanceDataAPI(redisClient),
    messySectorsAndIndustries: new MessySectorsAndIndustries(redisClient),
  }),
  context: async ({ req }) => ({
    redisClient,
  }),
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
