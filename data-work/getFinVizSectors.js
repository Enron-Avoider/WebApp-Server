const fetch = require("node-fetch");
const fs = require("fs");

const getStuff = (ticker) => fetch(`http://localhost:8080/by-ticker/${ticker}`);

(async () => {
  const stocks = await new Promise((resolve, reject) => {
    fs.readFile("all.json", "utf8", (err, buffer) => {
      if (err) reject(err);
      else resolve(JSON.parse(buffer));
    });
  });

  const stocksWithFinVizSectorAndIndustry = stocks.reduce(
    async (accUnresolved, s, i) => {
      const accResolved = await accUnresolved;
      
      await new Promise((t) => setTimeout(t, 100));
      console.log(s.ticker);

      const sWithMore = await getStuff(s.ticker)
        .then((res) => res.json())
        .then((res) => {
          const [FinVizSector, FinVizIndustry, FinVizCountry] = res.data.map(
            (a) => a.name
          );
          return {
            ...s,
            FinVizSector,
            FinVizIndustry,
            FinVizCountry,
          };
        })
        .catch((err) => {
          console.log({ err });
          return {
            ...s,
          };
        });

      const updatedAll = [...accResolved, sWithMore];

      fs.writeFileSync("all2.json", JSON.stringify(updatedAll, null, 2));

      return updatedAll;
    },
    []
  );

  console.log("here!!");
})();
