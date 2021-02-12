const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar JSON

  type EODStock {
    code: String
    name: String
    adjusted_close: String
    country: String
    exchange: String
    EDOExchange: String
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

  type Query {
    searchStocks(name: String): [EODStock]
    getStockByCode(code: String): EODStock
    getAggregate(
      sector: String
      industry: String
      country: String
      exchange: String
      calcs: [JSON]
      wtv: String
    ): JSON

    getAggregateForStock(
      sector: String
      industry: String
      country: String
      exchange: String
      calcs: [JSON]
      wtv: String
    ): JSON

    getAllExchanges: JSON
    saveIndustriesToDB: JSON
    saveExchangesToDB: JSON
    updateStocksInDB: JSON
    updateStocksCompletely: JSON
    getDistinctStockNames: JSON
    getCurrencyToCurrencyTimeseries(currency: String, toCurrency: String): JSON
    getIndustryStocks(name: String): JSON
    getExchangeStocks(code: String): JSON

    # getAllIndustries: JSON
  }

  type Mutation {
    resetCache(key: String!): JSON
  }
`;
module.exports = {
  typeDefs,
};
