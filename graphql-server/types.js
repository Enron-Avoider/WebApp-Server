const { gql } = require("apollo-server");

const typeDefs = gql`
    type SimfinStock {
        simId: String,
        ticker: String,
        name: String,
        fyearEnd: String,
        employees: String,
        sectorName: String,
        sectorCode: String,
        industryCompanies: [SimfinStock]
        # financials: []
    }

    # type Financials {
    #     years: Int[]
    # }

    type Query {
        findSimfinStockByName(name: String): [SimfinStock],
        getSimfinCompanyById(id: String): SimfinStock
    }
`;

const resolvers = {
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
    // financials: async (_source, params, { dataSources, redisClient }) =>
    //     dataSources.messyFinanceDataAPI.getStockFinancials(_source, redisClient)
    
  }
};

module.exports = {
  resolvers,
  typeDefs
};
