const { gql } = require("apollo-server");

module.exports = {
  typeDefs: gql`
    type Book {
      title: String
      author: String
      movie(id: String, month: String): Movie
    }

    type Movie {
        name: String
    }

    type Query {
      book(id: String, month: String): Book
    }
  `,
};
