import { gql } from "@apollo/client";

export const GET_LAST_YEAR_COUNTS = gql`
    query($query: AggregationInputQuery ) { 
        getLastYearCounts(
            query: $query
        )
    }
`;

export const GET_AGGREGATE_FOR_FINANCIAL_ROW = gql`
    query($query: AggregationInputQuery, $companiesForRow: String ) {
        getAggregateForFinancialRows(
            query: $query,
            companiesForRow: $companiesForRow
        )
    }
`;

export const GET_AGGREGATES_FOR_FINANCIAL_ROWS = (aggregatesList: string[], stock?: any) => {
    const uglyness = (aggregatesList: string[]) => `${JSON.stringify(aggregatesList.reduce(
        (p, v) => ({
            ...p,
            [v]:
                (v => `getAggregateForFinancialRows(query: { ${v[0] === 'Stock_Related' ? v[1].replaceAll("_", " ") : v[0]
                    }: "${v[0] === 'Stock_Related' ? stock[v[1]] : v[1]?.replaceAll("_", " ")
                    }" })`)
                    (v.split('__'))
        }),
        {
            all: `getAggregateForFinancialRows(query: {})`
        }))
        .replaceAll('\\"', '+')
        .replaceAll('"', '')
        .replaceAll('+', '"')
        }`;

    // console.log({ uglyness: uglyness(aggregatesList, stock) });

    return gql`${uglyness(aggregatesList)}`;
}

export const GET_AGGREGATE_FOR_CALC_ROW = gql`
    query($query: AggregationInputQuery, $companiesForRow: String, $collectionId: String ) {
        getAggregateForCalcRows(
            query: $query,
            companiesForRow: $companiesForRow,
            collectionId: $collectionId
        )
    }
`;

export const GET_AGGREGATES_FOR_CALC_ROWS = ({
    aggregatesList,
    stock,
    collectionId,
    calcs,
}: {
    aggregatesList: string[],
    stock?: any,
    collectionId?: string,
    calcs?: any[]
}) => {
    const uglyness = (aggregatesList: string[]) => `${JSON.stringify(aggregatesList.reduce(
        (p, v) => ({
            ...p,
            [v]:
                (v => `getAggregateForCalcRows(collectionId:"${collectionId}", query: { ${v[0] === 'Stock_Related' ? v[1].replaceAll("_", " ") : v[0]
                    }: "${v[0] === 'Stock_Related' ? stock[v[1]] : v[1]?.replaceAll("_", " ")
                    }"})`)
                    (v.split('__'))
        }),
        {
            all: `getAggregateForCalcRows(query: {})`
        }))
        .replaceAll('\\"', '+')
        .replaceAll('"', '')
        .replaceAll('+', '"')
        }`;

    return gql`${uglyness(aggregatesList)}`;
}

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
