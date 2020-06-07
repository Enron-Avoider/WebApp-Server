const { gql } = require("apollo-server");
// const GraphQLJSON = require("graphql-type-json");

module.exports = {
  // JSON: GraphQLJSON,
  Query: {
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

    getSector: async (_source, params, { dataSources }) =>
      dataSources.messySectorsAndIndustries.getSector(params.name),

    getAllSectors: async (_source, params, { dataSources }) =>
      dataSources.messySectorsAndIndustries.getAllSectors(),

    getIndustry: async (_source, params, { dataSources }) =>
      dataSources.messySectorsAndIndustries.getIndustry(params.name),

    getAllIndustries: async (_source, params, { dataSources }) =>
      dataSources.messySectorsAndIndustries.getAllIndustries(),
  },
};
