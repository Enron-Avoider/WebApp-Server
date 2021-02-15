const { ApolloServer } = require("apollo-server");
const MongoClient = require("mongodb").MongoClient;

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

mongoClient.connect(async (err) => {
  const mongoDB = mongoClient.db("Enron");

  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      ...query,
      ...mutation,
    },
    dataSources: () => ({
      EODDataAPI: new EODDataAPI(mongoDB),
      Ours: new Ours(mongoDB)
    }),
    context: async ({ req }) => ({
      mongoDB,
    }),
    playground: true,
  });

  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
});

// so server really dies on ctrl+c
process.on("SIGINT", () => process.exit(1));
