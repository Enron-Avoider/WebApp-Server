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

export const GET_ALL_INDUSTRIES = gql`
    query {
        getAllIndustries
    }
`;

export const GET_ALL_SECTORS = gql`
    query {
        getAllSectors
    }
`;

export const GET_ALL_SECTOR_AND_INDUSTRY_LINKS = gql`
    query {
        getSectorAndIndustryLinks
    }
`;