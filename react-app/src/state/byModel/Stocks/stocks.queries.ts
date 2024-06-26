import { gql } from "@apollo/client";

export const GET_STOCK = gql`
    query($ticker: String!) {
        getStockByCode(code: $ticker) {
            code
            name
            country
            exchange
            currency_symbol
            currency_code
            market_capitalization
            sector
            industry
            description
            logo
            yearlyFinancials {
                years,
                pl,
                bs,
                cf,
                aggregatedShares,
                price,
                marketCap
            }
            yearlyFinancialsWithKeys
        }
    }
`;

export const SEARCH_QUERY = gql`
    query($name: String!) {
        searchStocks(name: $name) {
            name,
            code,
            exchange,
            EODExchange,
            market_capitalization,
            sector,
            industry
        }
    }
`;
