const fetch = require("node-fetch");
const fs = require("fs");

const getStuff = (page = 0) =>
  fetch(
    "https://simfin.com/api/v1/finder?api-key=QPUY3ma4Lj69NsEYCb3HNGfiQstUAhpJ",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: [{ indicatorId: "0-73" }, { indicatorId: "0-71" }],
        resultsPerPage: "290",
        currentPage: page,
      }),
    }
  );

(async () => {
  const all = await [...Array(10)].reduce(async (accUnresolved, number, i) => {
    const accResolved = await accUnresolved;

    console.log(`working on number ${i}`);

    const results = await getStuff(i)
      .then((res) => res.json())
      .then((res) => res.results.map(r => ({
        name: r.name,
        SimFinsector: r.values[0].value,
        ticker: r.values[1].value,
      })))
      .catch((err) => { console.log({ err }) });

    return [...accResolved, ...results];
  }, []);

  console.log({ all });

  fs.writeFileSync('all.json', JSON.stringify(all, null, 2))

  //   Promise.all(
  //     new Array(10).map(async (item, i) => {
  //       console.log({ i });
  //       await getStuff(i)
  //         .then((res) => res.json())
  //         .then((res) => {
  //           console.log({ i, results: res.results });
  //         })
  //         .catch((err) => {
  //           console.log({ err });
  //         });
  //     })
  //   );

  console.log("here!!");
})();
