import { gql } from "apollo-boost";

import { stringifyWithoutQuotesOnKeys } from "@utils/stringifyWithoutQuotesOnKeys";

export const GET_LAST_YEAR_COUNTS = gql`
    query($query: AggregationInputQuery ) { 
        getLastYearCounts(
            query: $query
        )
    }
`;

export const GET_AGGREGATE_FOR_FINANCIAL_ROWS = gql`
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
                (v => `getAggregateForFinancialRows(stockToRank:"${stock.name}", query: { ${v[0] === 'Stock_Related' ? v[1].replaceAll("_", " ") : v[0]
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
                (v => `getAggregateForCalcRows(stockToRank:"${stock.name}", collectionId:"${collectionId}", calcs:${stringifyWithoutQuotesOnKeys(calcs) }, query: { ${v[0] === 'Stock_Related' ? v[1].replaceAll("_", " ") : v[0]
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


// ${aggregatesList.reduce(
//     (p, v) => ({
//         ...p,
//         [v]:
//             (v => ({
//                 [v[0]]: `${queryString(
//                     v[0],
//                     v[1]
//                 )}`
//             }) )
//                 (v.split('__'))
//     }),
//     {})
//     }

// {
//     ${`Stock_Related__Industry`}: getAggregateForFinancialRows(
//         query: {
//             industry: "Medical Devices"
//         }
//     ),
//     b: getAggregateForFinancialRows(
//         query: {
//             industry: "Internet Content & Information"
//         }
//     )
// }

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
