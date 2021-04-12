module.exports = {
  Query: {
    searchStocks: async (_source, params, { dataSources }) =>
      await dataSources.Ours.searchStocks(params),
    getStockByCode: async (_source, params, { dataSources }) =>
        dataSources.Ours.getStockByCode(params),
    //   dataSources.EODDataAPI.getStockByCode(
    //     params,
    //     dataSources
    //   ),
    getLastYearCounts: async (_source, params, { dataSources }) =>
      dataSources.Ours.getLastYearCounts(params),
    getAggregateForFinancialRows: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregateForFinancialRows(params),
    getAggregateForCalcRows: async (_source, params, { dataSources }) =>
      dataSources.Ours.getAggregateForCalcRows(params),
    getRatioCollections: async (_source, params, { dataSources }) =>
      dataSources.Ours.getRatioCollections(params),
    getUserById: async (_source, params, { dataSources }) =>
      dataSources.Ours.getUserById(params),
    getRows: async (_source, params, { dataSources }) =>
      dataSources.Ours.getRows(params),

    // Internal
    getCurrencyToCurrencyTimeseries: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getCurrencyToCurrencyTimeseries(params),
    getExchangeStocks: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getExchangeStocks(params),
    getAllExchanges: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAllExchanges(params),
  },
};
