const { ApolloServer } = require("apollo-server");
const responseCachePlugin = require("apollo-server-plugin-response-cache");
const { RedisCache } = require("apollo-server-cache-redis");
const redis = require("redis");

const { resolvers } = require("./resolvers");
const { typeDefs } = require("./types");
const { MoviesAPI } = require("./data-sources");

const redisClient = redis.createClient({
  port: 13082,
  host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
  password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
});

// redisClient.del("foo_rand000000000000");
// redisClient.set("foo_rand000000000000", 'huuuuuum');
// redisClient.get("foo_rand000000000000", function (err, reply) {
//   console.log(reply ? reply.toString() : 'nothing'); // Will print `OK`
// });

// redisClient.flushdb( function (err, succeeded) {
//     console.log(succeeded); // will be true if successfull
// });

// [...Array(1000000).keys()].map((a, i) => {
//     // console.log(`foo_rand00000000000${i}`);

//     // redisClient.set(`foo_rand00000000000${i}`, `2huuuuuum${i}`);
//     redisClient.get(`foo_rand00000000000${i}`, function (err, reply) {
//       console.log(reply ? reply.toString() : 'nothing'); // Will print `OK`
//     });

// })

// const test = async () => {
//   await new Promise((r) => setTimeout(() => r(), 1000));
//   console.log("test");
// };
// test();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
  context: async ({ req }) => ({
    redisClient,
  }),
    // After much  effort I had to give up on a plugin for caching
    // as I could only get it to kinda work for single requests
    // with responseCachePlugin it doesn't do partial
    // bastards
    //
    //   cacheControl: { defaultMaxAge: 0 },
    //   plugins: [responseCachePlugin()],
    //   cache: new RedisCache({
    //     port: 13082,
    //     host: "redis-13082.c15.us-east-1-2.ec2.cloud.redislabs.com",
    //     password: "fQolpdEms8L2eiQ4H4ODcRxKQ7uNSKmN",
    //   }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
