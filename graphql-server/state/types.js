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

  type EODStock {
    code: String
    name: String
    adjusted_close: String
    country: String
    exchange: String
    EDOExchange: String
    currency_symbol: String
    currency_code: String
    market_capitalization: String
    sector: String
    industry: String
    description: String
    logo: String
    yearlyFinancials: YearlyFinancials
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
    findStock(name: String): [EODStock]
    getStockByCode(code: String): EODStock
    getSectorStocks(name: String): JSON
    getIndustryStocks(name: String): JSON
    saveAllStocksToDB: JSON
    getAllIndustries: JSON
    saveIndustriesToDB: JSON
    updateStocksInDB: JSON

    findSimfinStockByName(name: String): [SimfinStock]
    getSimfinCompanyById(id: String): SimfinStock
    getSimfinCompanyByTicker(name: String): SimfinStock

    getStockToSectorAndIndustryData: JSON
    getSectorAndIndustryLinks: JSON
    getSector(name: String): Sector
    getAllSectors: JSON
    getIndustry(name: String): Industry
    # getAllIndustries: JSON
  }

  type Mutation {
    resetCache(key: String!): JSON
  }
`;
module.exports = {
  typeDefs,
};
