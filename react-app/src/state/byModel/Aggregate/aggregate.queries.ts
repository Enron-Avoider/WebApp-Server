import { gql } from "apollo-boost";

export const GET_LAST_YEAR_COUNTS = gql`
    query($query: AggregationInputQuery ) { 
        getLastYearCounts(
            query: $query
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

export const GET_AGGREGATES_FOR_FINANCIAL_ROWS = (aggregatesList: string[]) => {
    const uglyness = (aggregatesList: string[]) => `${JSON.stringify(aggregatesList.reduce(
        (p, v) => ({
            ...p,
            [v]:
                (v => `getAggregateForFinancialRows(query: { ${v[0]}: "${v[1]?.replace("_", " ")}" })`)
                    (v.split('__'))
        }),
        {}
    ))
        .replaceAll('\\"', '+')
        .replaceAll('"', '')
        .replaceAll('+', '"')
        }`;

    console.log({ uglyness: uglyness(aggregatesList) });

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
