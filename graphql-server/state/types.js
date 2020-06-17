const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar JSON

  type SimfinStock {
    simId: String
    ticker: String
    name: String
    fyearEnd: String
    employees: String
    sectorAndIndustry: SectorAndIndustry
    industryCompanies: [SimfinStock]
    # aggregatedSharesIsolated: JSON
    shareClasses: [JSON]
    years: [Int]
    yearlyFinancials: YearlyFinancials
    logo: String
    # yearlyPrices: [JSON]
  }

  type YearlyFinancials {
    years: [Int]
    aggregatedShares: [JSON]
    price: [JSON]
    pl: [JSON]
    bs: [JSON]
    cf: [JSON]
  }

  type SectorAndIndustry {
    sector: String
    industry: String
  }

  type Sector {
    name: String
    companies: [SimfinStock]
    yearlyFinancialAddedUp: YearlyFinancials
    # aggregatedShares: [JSON]
    # aggregatedSharesIsolated: JSON
    # price: [JSON]
  }

  type Industry {
    name: String
    companies: [SimfinStock]
    yearlyFinancialsAddedUp: YearlyFinancials
    # aggregatedShares: [JSON]
    # aggregatedSharesIsolated: JSON
    # price: [JSON]
  }

  type Query {
    findSimfinStockByName(name: String): [SimfinStock]
    getSimfinCompanyById(id: String): SimfinStock
    getSimfinCompanyByTicker(name: String): SimfinStock

    getStockToSectorAndIndustryData: JSON
    getSector(name: String): Sector
    getAllSectors: JSON
    getIndustry(name: String): Industry
    getAllIndustries: JSON
  }

  type Mutation {
    resetCache(key: String!): JSON
  }
`;
module.exports = {
  typeDefs,
};
