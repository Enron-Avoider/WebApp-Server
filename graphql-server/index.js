const { ApolloServer } = require("apollo-server");
const MongoClient = require("mongodb").MongoClient;
const AWS = require("aws-sdk");
// const s3 = require('s3');

const { typeDefs } = require("./state/types");
const { EODDataAPI, Ours } = require("./state/data-sources");
const { query, mutation } = require("./state/resolvers");
const atlasCredentials = require("./credentials/atlas-credentials.json");
const awsCredentials = require("./credentials/aws-credentials.json");

const mongoClient = new MongoClient(
  `mongodb+srv://${atlasCredentials.username}:${atlasCredentials.password}@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const s3 = new AWS.S3({
  accessKeyId: awsCredentials.accessKeyId,
  secretAccessKey: awsCredentials.secretAccessKey,
});

mongoClient.connect(async (err) => {
  const mongoDB = mongoClient.db("Enron");

  const server = new ApolloServer({
    introspection: true,
    playground: true,
    cors: {
      origin: true, //"*",
      allowedHeaders: ['Origin','X-Requested-With','contentType','Content-Type','Accept','Authorization'],
      credentials: true,
    },
    typeDefs,
    resolvers: {
      ...query,
      ...mutation,
    },
    dataSources: () => ({
      EODDataAPI: new EODDataAPI(mongoDB, s3),
      Ours: new Ours(mongoDB, s3),
    }),
    context: async ({ req }) => ({
      mongoDB,
      s3,
    }),
  });

  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(
      `🚀  Server ready at ${url} on env:${process.env.NODE_ENV} and port:${process.env.PORT}`
    );
  });
});

// so server really dies on ctrl+c
process.on("SIGINT", () => process.exit(1));
