const { ApolloServer } = require("apollo-server");
const redis = require("redis");
const S3 = require("aws-sdk/clients/s3");
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://aiaiai:iaiaia@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { typeDefs } = require("./state/types");
const {
  MessyFinanceDataAPI,
  MessySectorsAndIndustries,
  EODDataAPI,
} = require("./state/data-sources");
const { stocks, query, mutation } = require("./state/resolvers");

const redisClient = redis.createClient({
  port: 13082,
  host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
  password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
});

mongoClient.connect(async (err) => {
  const mongoDB = mongoClient.db("Enron");
  //   const collection = mongoDB.collection("tests");
  //   const insert = await collection.insertMany([{ a: 1 }]);
  //   const getAll = await collection.find({}).toArray();
  //   const deleteAll = await Promise.all(
  //     getAll.map(async (obj) => collection.deleteOne(obj))
  //   );
  //   console.log({ insert, getAll, deleteAll });
  //   mongoClient.close();

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
      EODDataAPI: new EODDataAPI(mongoDB),
    }),
    context: async ({ req }) => ({
      redisClient,
      mongoDB
    }),
    playground: true,
  });

  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
});

// so server really dies on ctrl+c
process.on('SIGINT', () => process.exit(1));
