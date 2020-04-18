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
        aggregatedShares: [JSON],
        shareClasses: [ShareClasses],
        years: [Int],
        yearlyFinancials: YearlyFinancials,
        # yearlyPrices: [JSON] 
    }

    type ShareClasses {
        simId: String,
        shareClassId: String,
        shareClassName: String,
        shareClassType: String,
        years: [Int],
        yearlyPrices: JSON
    }

    type YearlyFinancials {
        years: [Int],
        pl: [JSON],
        bs: [JSON],
        cf: [JSON]
    }

    type Query {
        findSimfinStockByName(name: String): [SimfinStock],
        getSimfinCompanyById(id: String): SimfinStock,
        getSimfinCompanyByTicker(name: String): SimfinStock
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
        dataSources.messyFinanceDataAPI.getSimfinCompanyById(params, redisClient),

    getSimfinCompanyByTicker: async (_source, params, { dataSources, redisClient }) => {
        const stocks = [
            ... await dataSources.messyFinanceDataAPI.findSimfinStockByName(params, redisClient),
            ... await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(params, redisClient)
        ]

        return  dataSources.messyFinanceDataAPI.getSimfinCompanyById({id: stocks[0].simId}, redisClient)
    }
  },
  SimfinStock: {

    aggregatedShares: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.aggregatedShares(_source, redisClient),

    shareClasses: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.shareClasses(_source, redisClient),

    industryCompanies: async (_source, params, { dataSources, redisClient }) =>
        (await dataSources.messyFinanceDataAPI.getSimfinIndustryCompanies(_source.sectorCode, redisClient))
            .map(async (company) =>
                 ({
                    years: _source.years,
                    ...await dataSources.messyFinanceDataAPI.getSimfinCompanyById({ id: company.simId }, redisClient)
                })
            ),

    yearlyFinancials: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.yearlyFinancials(_source, redisClient),

    // yearlyPrices: async (_source, params, { dataSources, redisClient }) =>
    //     dataSources.messyFinanceDataAPI.yearlyPrices(_source, redisClient),
  },

  ShareClasses: {
    yearlyPrices: async (_source, params, { dataSources, redisClient }) =>
        dataSources.messyFinanceDataAPI.pricesForShareClasses(_source, redisClient)
  }
};

module.exports = {
  resolvers,
  typeDefs
};
