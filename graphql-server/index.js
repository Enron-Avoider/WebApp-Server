const { ApolloServer } = require("apollo-server");
const MongoClient = require("mongodb").MongoClient;
const AWS = require('aws-sdk');
// const s3 = require('s3');

const { typeDefs } = require("./state/types");
const { EODDataAPI, Ours } = require("./state/data-sources");
const { query, mutation } = require("./state/resolvers");

const mongoClient = new MongoClient(
  "mongodb+srv://aiaiai:iaiaia@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
 
const s3 = new AWS.S3({
    accessKeyId: "AKIAT6OBIZ43ER6XOFZ7",
    secretAccessKey: "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",
    // region: "us-east-1"
});

mongoClient.connect(async (err) => {
  const mongoDB = mongoClient.db("Enron");

  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      ...query,
      ...mutation,
    },
    dataSources: () => ({
      EODDataAPI: new EODDataAPI(mongoDB, s3),
      Ours: new Ours(mongoDB, s3)
    }),
    context: async ({ req }) => ({
      mongoDB,
      s3
    }),
    playground: true,
  });

  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
});

// so server really dies on ctrl+c
process.on("SIGINT", () => process.exit(1));
