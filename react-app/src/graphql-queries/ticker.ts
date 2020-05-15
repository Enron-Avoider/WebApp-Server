import { gql } from "apollo-boost";

export default gql`
    query($ticker: String!) { 
        getSimfinCompanyByTicker(name: $ticker) {
            name
            ticker
            logo
            simId
            fyearEnd
            employees
            sectorName
            sectorCode
            aggregatedShares
            price
            shareClasses
            years
            yearlyFinancials {
                pl
                bs
                cf
            }
        }
    }
`;