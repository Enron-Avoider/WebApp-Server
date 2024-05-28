const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar JSON

  type Stock {
    code: String
    name: String
    adjusted_close: String
    country: String
    url: String
    exchange: String
    EODExchange: String
    currency_symbol: String
    currency_code: String
    fundamentalsCurrency: String
    finalCurrency: String
    yearlyCurrencyPairsForFundamental: JSON
    yearlyCurrencyPairsForPrice: JSON
    market_capitalization: String
    sector: String
    industry: String
    description: String
    logo: String
    yearlyFinancials: YearlyFinancials
    yearlyFinancialsWithKeys: JSON
    yearlyFinancialsByYear: JSON
    dataByYear: JSON
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
    isOwnedByUser: Boolean
    isOwnedByPlatform: Boolean
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
    name: String
    avatarUrl: String,
    isPlatformAdmin: Boolean
  }

  type Query {
    searchStocks(name: String): [Stock]
    getStockByCode(code: String): Stock
    getProviderStockByCode(code: String): Stock
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
    getCurrencyToCurrencyTimeseries(currency: String, toCurrency: String): JSON
    getIndustryStocks(name: String): JSON
    getExchangeStocks(code: String): JSON
    getRatioCollections(userId: String!): [RatioCollection]
    getRows: JSON

    getUserById(id: String): User
  }

  type Mutation {
    saveRatioCollection(ratioCollection: JSON, userId: String): RatioCollection
    saveUser(user: JSON, userId: String): User
    updateStocksCompletely(userId: String): JSON
    updateSingleStock(userId: String, Code: String, Exchange: String, DontSkip: Boolean): JSON
    removeEmptyAndDuplicates(userId: String): JSON
    # resetCache(key: String!): JSON
  }
`;
module.exports = {
  typeDefs,
};
