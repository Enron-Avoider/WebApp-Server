import { gql } from "apollo-boost";

export const GET_USER_BY_ID = gql`
    query($id: String!) {
        getUserById(id: $id) {
            name
            avatarUrl
            isPlatformAdmin
        }
    }
`;
