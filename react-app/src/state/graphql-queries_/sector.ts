import { gql } from "apollo-boost";

export default gql`
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