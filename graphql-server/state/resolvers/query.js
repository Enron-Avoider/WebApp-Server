const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Query: {
    //EOD
    searchStocks: async (_source, params, { dataSources }) =>
      await dataSources.EODDataAPI.searchStocks(params),
    getStockByCode: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getStockByCode(params),
    getAggregate: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAggregate(params),
    getAggregateForStock: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAggregateForStock(params),
    getExchangeStocks: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getExchangeStocks(params),
    getAllExchanges: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAllExchanges(params),
    updateStocksCompletely: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateStocksCompletely(params),
    getDistinctStockNames: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getDistinctStockNames(params),
    getCurrencyToCurrencyTimeseries: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getCurrencyToCurrencyTimeseries(params),
  },
};
