import { gql } from "apollo-boost";

export default gql`
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