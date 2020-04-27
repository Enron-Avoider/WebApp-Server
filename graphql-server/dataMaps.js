// TODO: Move all this to server

const numeral = require("numeral");

const priceTableMap = (years, shareClassName, yearlyPrices) =>
  yearlyPrices.priceData.reduce(
    (acc, curr, i) => ({
      ...acc,
      [`${years[i]}`]: numeral(curr ? curr.closeAdj : "0").format("(0.00a)"),
    }),
    { title: shareClassName }
  );

const outstandingSharesTableMap = (years, aggregatedShares) =>
  aggregatedShares.reduce(
    (acc, curr, i) => ({
      ...acc,
      [`${years[i]}`]: numeral(curr ? curr.value : "0").format("(0.00a)"),
    }),
    { title: "Outstanding Shares" }
  );

const financialTableMap = (years, yearlyFinancials) =>
  Object.getOwnPropertyNames(yearlyFinancials)
    .filter((k) => k !== "__typename") // graphql spam
    .reduce(
      (acc, key, i) => ({
        ...acc,
        [key]: yearlyFinancials[key]
          .filter((dataPoint) => dataPoint.value.find((e) => Number(e)))
          .reduce((acc, dataPoint, i) => {
            if (dataPoint.displayLevel === "0") {
              return [...acc, dataPointValuesToTableRow(dataPoint, years)];
            } else if (dataPoint.displayLevel === "1") {
              return [
                ...acc.map((tableRow, i) => {
                  if (i === acc.length - 1) {
                    // last
                    return {
                      ...tableRow,
                      subRows: [
                        ...tableRow.subRows,
                        dataPointValuesToTableRow(dataPoint, years),
                      ],
                    };
                  } else {
                    return tableRow;
                  }
                }),
              ];
            } else if (dataPoint.displayLevel === "2") {
              return [
                ...acc.map((tableRow, i) => {
                  if (i === acc.length - 1) {
                    return {
                      ...tableRow,
                      subRows: tableRow.subRows.map((tableSubRow, i) => {
                        if (i === tableRow.subRows.length - 1) {
                          return {
                            ...tableSubRow,
                            subRows: [
                              ...tableSubRow.subRows,
                              dataPointValuesToTableRow(dataPoint, years),
                            ],
                          };
                        } else {
                          return tableSubRow;
                        }
                      }),
                    };
                  } else {
                    return tableRow;
                  }
                }),
              ];
            } else {
              console.log(dataPoint.displayLevel, dataPoint.standardisedName);
              return acc;
            }
          }, []),
      }),
      {}
    );

const dataPointValuesToTableRow = (dataPoint, years) =>
  dataPoint.value.reduce(
    (acc, value, i) => ({
      ...acc,
      [`${years[i]}`]: numeral(value).format("(0.00a)"),
    }),
    { title: dataPoint.standardisedName, subRows: [] }
  );

module.exports = {
  priceTableMap,
  financialTableMap,
  outstandingSharesTableMap,
};
