import { gql } from "apollo-boost";

export const GET_INDUSTRY = gql`
    query($name: String!) {
        getIndustry(name: $name) {
            name
            companies {
                name
                ticker
            }
            yearlyFinancialsAddedUp{
                years
                pl
                bs
                cf
            }
        }
    }
`;

export const GET_SECTOR = gql`
    query($name: String!) {
        getSector(name: $name) {
            name
            companies {
                name
                ticker
            }
            yearlyFinancialsAddedUp{
                pl
                bs
                cf
            }
        }
    }
`;