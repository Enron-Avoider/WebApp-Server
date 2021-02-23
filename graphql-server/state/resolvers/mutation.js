const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Mutation: {
    saveRatioCollection: async (_source, params, { dataSources }) =>
      await dataSources.Ours.saveRatioCollection(params),
  },
};
