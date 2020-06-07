const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar JSON

  type SimfinStock {
    simId: String
    ticker: String
    name: String
    fyearEnd: String
    employees: String
    sectorName: String
    sectorCode: String
    industryCompanies: [SimfinStock]
    aggregatedShares: [JSON]
    aggregatedSharesIsolated: JSON
    price: [JSON]
    shareClasses: [JSON]
    years: [Int]
    yearlyFinancials: YearlyFinancials
    logo: String
    # yearlyPrices: [JSON]
  }

  type YearlyFinancials {
    years: [Int]
    pl: [JSON]
    bs: [JSON]
    cf: [JSON]
  }

  type Sector {
    name: String
    numberOfStocks: Int
    # yearlyFinancials: YearlyFinancials
    aggregatedShares: [JSON]
    aggregatedSharesIsolated: JSON
    price: [JSON]
  }

  type Industry {
    name: String
    numberOfStocks: Int
    # yearlyFinancials: YearlyFinancials
    aggregatedShares: [JSON]
    aggregatedSharesIsolated: JSON
    price: [JSON]
  }

  type Query {
    findSimfinStockByName(name: String): [SimfinStock]
    getSimfinCompanyById(id: String): SimfinStock
    getSimfinCompanyByTicker(name: String): SimfinStock

    getSector(name: String): JSON
    getAllSectors: JSON
    getIndustry(name: String): JSON
    getAllIndustries: JSON
  }
`;
module.exports = {
  typeDefs,
};
