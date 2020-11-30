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
