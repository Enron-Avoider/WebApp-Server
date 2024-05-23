import { gql } from "@apollo/client";

export const GET_USER_KEYS = gql`
  {
    userKeys @client {
        id
    }
  }
`;

export const ADD_USER_KEY = gql`
  mutation addUserKey($id: String!) {
    addUserKey(id: $id) @client {
      id
    }
  }
`;