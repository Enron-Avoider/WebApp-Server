const express = require("express");
const app = express();
const port = 5000;

app.get("/movie", (req, res) => {
  console.log("/movie");
  return res.jsonp({
    name: "movie1",
  });
});

app.get("/book", (req, res) => {
  console.log("/book");
  return res.jsonp({
    title: "book1",
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
