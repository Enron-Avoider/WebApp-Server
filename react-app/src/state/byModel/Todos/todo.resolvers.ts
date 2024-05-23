import { gql } from '@apollo/client';
// import RandomID from "random-id";
import { GET_TODOS } from "./todos.queries";

export const todoResolvers = {
  Mutation: {
    addTodo: (_: any, todo: any, { cache }: any) => {
      const { todos } = cache.readQuery({ query: GET_TODOS });
      let new_todo = {
        // id: RandomID(10),
        name: todo.name,
        completed: false,
        // test: {
        //     test: 'test',
        //     __typename: "test2"
        // },
        __typename: "todo"
      };
      cache.writeQuery({
        query: gql`
        query {
          todos {
            __typename
            name
            completed
          }
        }
        `,
        data: {
          todos: [...todos, new_todo]
        }
      });
      // console.log("TODOS: ", cache.readQuery({ query: GET_TODOS }));
      return new_todo;
    }
  }
};