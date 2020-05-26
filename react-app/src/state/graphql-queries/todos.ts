import { gql } from "apollo-boost";

export const GET_TODOS = gql`
  {
    todos @client {
      id
      name
      completed
      test {
        test
      }
    }
  }
`;

export const ADD_TODO = gql`
  mutation addTodo($name: String!) {
    addTodo(name: $name) @client {
      name
    }
  }
`;