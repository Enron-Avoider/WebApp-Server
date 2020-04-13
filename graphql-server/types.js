const { gql } = require("apollo-server");
const GraphQLJSON = require('graphql-type-json');

const typeDefs = gql`
    scalar JSON

    type SimfinStock {
        simId: String,
        ticker: String,
        name: String,
        fyearEnd: String,
        employees: String,
        sectorName: String,
        sectorCode: String,
        industryCompanies: [SimfinStock],
        yearlyFinancials: YearlyFinancials
    }

    type YearlyFinancials {
        years: [Int],
        pl: [JSON],
        bs: [JSON],
        cf: [JSON]
    }

    type Query {
        findSimfinStockByName(name: String): [SimfinStock],
        getSimfinCompanyById(id: String): SimfinStock
    }
`;

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    findSimfinStockByName: async (_source, params, { dataSources, redisClient }) =>
        [
            ... await dataSources.messyFinanceDataAPI.findSimfinStockByName(params, redisClient),
            ... await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(params, redisClient)
        ],
    getSimfinCompanyById: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.getSimfinCompanyById(params, redisClient)
  },
  SimfinStock: {
    industryCompanies: async (_source, params, { dataSources, redisClient }) =>
        (await dataSources.messyFinanceDataAPI.getSimfinIndustryCompanies(_source.sectorCode, redisClient))
            .map(async (company) =>
                await dataSources.messyFinanceDataAPI.getSimfinCompanyById({ id: company.simId }, redisClient)
            ),
    yearlyFinancials: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.yearlyFinancials(_source, redisClient)
  }
};

module.exports = {
  resolvers,
  typeDefs
};
