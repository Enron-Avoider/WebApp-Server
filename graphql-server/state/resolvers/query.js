const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Query: {
    //EOD
    searchStocks: async (_source, params, { dataSources }) =>
      await dataSources.Ours.searchStocks(params),
    getStockByCode: async (_source, params, { dataSources }) =>
      dataSources.Ours.getStockByCode(params),
    getAggregate: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregate(params),
    getAggregateForStock: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregateForStock(params),
    getExchangeStocks: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getExchangeStocks(params),
    getAllExchanges: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAllExchanges(params),
    updateStocksCompletely: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateStocksCompletely(params),
    removeEmptyAndDuplicates: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.removeEmptyAndDuplicates(params),
    getDistinctStockNames: async (_source, params, { dataSources }) =>
      dataSources.Ours.getDistinctStockNames(params),
    getCurrencyToCurrencyTimeseries: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getCurrencyToCurrencyTimeseries(params),
  },
};
