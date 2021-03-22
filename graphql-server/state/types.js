const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar JSON

  type Stock {
    code: String
    name: String
    adjusted_close: String
    country: String
    exchange: String
    EODExchange: String
    currency_symbol: String
    currency_code: String
    fundamentalsCurrency: String
    finalCurrency: String
    yearlyCurrencyPairs: JSON
    market_capitalization: String
    sector: String
    industry: String
    description: String
    logo: String
    yearlyFinancials: YearlyFinancials
    yearlyFinancialsWithKeys: JSON
    yearlyFinancialsByYear: JSON
    retrieved_at: String
    is_in_exchange_country: Boolean
  }

  type YearlyFinancials {
    years: [Int]
    aggregatedShares: [JSON]
    price: [JSON]
    marketCap: [JSON]
    pl: [JSON]
    bs: [JSON]
    cf: [JSON]
  }

  type Calc {
    title: String
    about: String
    calc: String
    scope: JSON
  }

  type RatioCollection {
    id: String
    name: String
    isOwnedByPlatform: Boolean
    isOwnedByUser: Boolean
    about: String
    calcs: [Calc]
  }

  input AggregationInputQuery {
    sector: String
    industry: String
    country: String
    exchange: String
  }

  type User {
    id: String
    name: String
    avatarUrl: String,
    isPlatformAdmin: Boolean
  }

  type Query {
    searchStocks(name: String): [Stock]
    getStockByCode(code: String): Stock
    getLastYearCounts(query: AggregationInputQuery): JSON
    getAggregateForFinancialRows(
        query: AggregationInputQuery,
        stockToRank: String,
        companiesForRow: String
    ): JSON
    getAggregateForCalcRows(
        query: AggregationInputQuery,
        collectionId: String,
        calcs: [JSON],
        stockToRank: String,
        companiesForRow: String
    ): JSON

    getAllExchanges: JSON
    saveIndustriesToDB: JSON
    saveExchangesToDB: JSON
    updateStocksInDB: JSON
    updateStocksCompletely: JSON
    removeEmptyAndDuplicates: JSON
    getDistinctStockNames: JSON
    getCurrencyToCurrencyTimeseries(currency: String, toCurrency: String): JSON
    getIndustryStocks(name: String): JSON
    getExchangeStocks(code: String): JSON
    getRatioCollections: [RatioCollection]

    getUserById(id: String): User
  }

  type Mutation {
    saveRatioCollection(ratioCollection: JSON): RatioCollection
    saveUser(user: JSON): User
    resetCache(key: String!): JSON
  }
`;
module.exports = {
  typeDefs,
};
