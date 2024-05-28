const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Mutation: {
    saveRatioCollection: async (_source, params, { dataSources }) =>
      await dataSources.Ours.saveRatioCollection(params),
    saveUser: async (_source, params, { dataSources }) =>
      await dataSources.Ours.saveUser(params),
    updateStocksCompletely: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateStocksCompletely(
        params,
        dataSources
      ),
    updateSingleStock: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateSingleStock(
        params,
        dataSources
      ),
    // removeEmptyAndDuplicates: async (_source, params, { dataSources }) =>
    //   dataSources.Ours.removeEmptyAndDuplicates(params),
  },
};
