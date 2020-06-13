const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Mutation: {
    resetCache: async (_source, { key }, { dataSources }) => {
      if (key === "DONT!") {
        return "👌";
      } else {
        return key;
      }
    },
  },
};
