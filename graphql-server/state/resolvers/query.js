module.exports = {
  Query: {
    searchStocks: async (_source, params, { dataSources }) =>
      await dataSources.Ours.searchStocks(params),
    getStockByCode: async (_source, params, { dataSources }) =>
      dataSources.Ours.getStockByCode(params),
    getAggregate: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregate(params),
    getAggregateForStock: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregateForStock(params),
    removeEmptyAndDuplicates: async (_source, params, { dataSources }) =>
      dataSources.Ours.removeEmptyAndDuplicates(params),
    getDistinctStockNames: async (_source, params, { dataSources }) =>
      dataSources.Ours.getDistinctStockNames(params),

    getRatioCollections: async (_source, params, { dataSources }) =>
      dataSources.Ours.getRatioCollections(params),
    // getSystemRatioCollections
    // getUserRatioCollections
    // saveRatioCollection

    // TODO: encapsulate somewhere else
    getCurrencyToCurrencyTimeseries: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getCurrencyToCurrencyTimeseries(params),
    getExchangeStocks: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getExchangeStocks(params),
    getAllExchanges: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAllExchanges(params),
    updateStocksCompletely: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateStocksCompletely(params),
  },
};
