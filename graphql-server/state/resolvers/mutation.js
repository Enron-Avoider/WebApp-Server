const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Mutation: {
    resetCache: async (_source, { key }, { dataSources, redisClient }) => {
      if (key === "DONT!") {
        redisClient.flushdb( function (err, succeeded) {
            console.log(succeeded); // will be true if successfull
        });
        return "👌";
      } else {
        return key;
      }
    },
  },
};
