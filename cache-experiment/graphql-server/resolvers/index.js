const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

module.exports = {
  resolvers: {
    Query: {
      book: async (_source, params, { dataSources, redisClient }) => {
        console.log("book resolver", params, _source);
        return dataSources.moviesAPI.getBook(params, redisClient);
      },
    },
    Book: {
      movie: async (_source, params, { dataSources, redisClient }) => {
        console.log("movie resolver", params, _source);
        return await dataSources.moviesAPI.getMovie(params, redisClient);
      },
    },
  },
};
