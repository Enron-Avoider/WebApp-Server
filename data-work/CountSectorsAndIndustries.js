const fetch = require("node-fetch");
const fs = require("fs");

(async () => {
  const stocks = (
    await new Promise((resolve, reject) => {
      fs.readFile("all2.json", "utf8", (err, buffer) => {
        if (err) reject(err);
        else resolve(JSON.parse(buffer));
      });
    })
  ).filter((s) => s.ticker !== null);

  const isolateAttributes = (array) => {
    const explore = (name, array) =>
      array
        .reduce(
          (acc, curr, i) => [
            ...acc,
            ...(curr[name] && !acc.find((s) => s === curr[name])
              ? [curr[name]]
              : []),
          ],
          []
        )
        .map((n) => ({
          [n]: array.filter((s) => s[name] === n).length,
        }));

    return {
      sector: explore("sector", array),
      FinVizSector: explore("FinVizSector", array),
      FinVizIndustry: explore("FinVizIndustry", array),
      FinVizCountry: explore("FinVizCountry", array),
    };
  };


  fs.writeFileSync("count.json", JSON.stringify(isolateAttributes(stocks), null, 2));
})();
