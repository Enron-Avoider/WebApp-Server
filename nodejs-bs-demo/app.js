var port = process.env.PORT || 3000,
  http = require("http");

var server = http.createServer(function (req, res) {
  res.writeHead(200);
  res.write('I exist!!');
  res.end();
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:" + port + "/");
