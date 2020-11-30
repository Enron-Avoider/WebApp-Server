const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Query: {
    //EOD
    findStock: async (_source, params, { dataSources }) =>
      [
        ...(await dataSources.EODDataAPI.findStockByName(params)),
        ...(await dataSources.EODDataAPI.findStockByTicker(params)),
      ].sort((a, b) => b.market_capitalization - a.market_capitalization),

    getStockByCode: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getStockByCode(params),
    getAggregate: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.getAggregate(params),

    // saveAllStocksToDB: async (_source, params, { dataSources }) =>
    //   dataSources.EODDataAPI.saveAllStocksToDB(params),
    // getAllIndustries: async (_source, params, { dataSources }) =>
    //   dataSources.EODDataAPI.getAllIndustries(params),
    // saveIndustriesToDB: async (_source, params, { dataSources }) =>
    //   dataSources.EODDataAPI.saveIndustriesToDB(params),
    updateStocksInDB: async (_source, params, { dataSources }) =>
      dataSources.EODDataAPI.updateStocksInDB(params),

    // simFin
    findSimfinStockByName: async (_source, params, { dataSources }) => [
      ...(await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(
        params
      )),
      ...(await dataSources.messyFinanceDataAPI.findSimfinStockByName(params)),
    ],
    getSimfinCompanyById: async (_source, params, { dataSources }) =>
      dataSources.messyFinanceDataAPI.getSimfinCompanyById(params),
    getSimfinCompanyByTicker: async (_source, params, { dataSources }) => {
      const stocks = [
        ...(await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(
          params
        )),
        ...(await dataSources.messyFinanceDataAPI.findSimfinStockByName(
          params
        )),
      ];
      return dataSources.messyFinanceDataAPI.getSimfinCompanyById({
        id: stocks[0].simId,
      });
    },
    getStockToSectorAndIndustryData: async (_source, params, { dataSources }) =>
      (
        await dataSources.messySectorsAndIndustries.getStockToSectorAndIndustryData()
      ).analysis,
    getSectorAndIndustryLinks: async (_source, params, { dataSources }) =>
      await dataSources.messySectorsAndIndustries.getSectorAndIndustryLinks(),
    getSector: async (_source, params, { dataSources }) => {},
    //dataSources.messySectorsAndIndustries.getSector(params.name),
    getAllSectors: async (_source, params, { dataSources }) =>
      await dataSources.messySectorsAndIndustries.getAllSectors(),
    getIndustry: async (_source, params, { dataSources }) =>
      dataSources.messySectorsAndIndustries.getIndustry(
        params.name,
        dataSources
      ),
    // getAllIndustries: async (_source, params, { dataSources }) =>
    //     await dataSources.messySectorsAndIndustries.getAllIndustries(),
  },
};
