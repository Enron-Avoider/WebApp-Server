import { gql } from "apollo-boost";

export const GET_AGGREGATE = gql`
    query($sector: String, $industry: String, $country: String, $exchange: String) { 
        getAggregate(
            sector: $sector,
            industry: $industry,
            country: $country, 
            exchange: $exchange
        )
    }
`;

export const GET_AGGREGATE_FOR_FINANCIAL_ROWS = gql`
    query($query: AggregationInputQuery ) {
        getAggregateForFinancialRows(
            query: $query
        )
    }
`;

export const GET_AGGREGATE_FOR_CALC_ROWS = gql`
    query($sector: String, $industry: String, $country: String, $exchange: String, $calcs: [JSON] ) { 
        getAggregateForCALCRows(
            sector: $sector,
            industry: $industry,
            country: $country, 
            exchange: $exchange,
            calcs: $calcs
        )
    }
`;
