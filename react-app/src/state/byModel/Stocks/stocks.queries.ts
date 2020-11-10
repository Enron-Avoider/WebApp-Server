import { gql } from "apollo-boost";

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
                price
            }
        }
    }
`;

// export const GET_STOCK = gql`
//     query($ticker: String!) { 
//         getSimfinCompanyByTicker(name: $ticker) {
//             name
//             ticker
//             logo
//             simId
//             fyearEnd
//             employees
//             sectorAndIndustry{
//                 sector
//                 industry
//             }
//             shareClasses
//             yearlyFinancials {
//                 years
//                 pl
//                 bs
//                 cf
//                 aggregatedShares
//                 price
//             }
//         }
//     }
// `;