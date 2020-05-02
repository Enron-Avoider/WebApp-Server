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

const outstandingSharesTableMap = (years, aggregatedShares) => {
  const filterByFigureAndPeriod = (figure, period, aggregatedShares) =>
    aggregatedShares
      .filter((s) => s.figure === figure)
      .filter((s) => s.period === period)
      .sort((a, b) => a.date - b.date)
      .reduce(
        (acc, curr, i) => ({
          ...acc,
          ...(years[i]
            ? {
                [`${years[i]}`]: numeral(curr ? curr.value : "0").format(
                  "(0.00a)"
                ),
              }
            : {}),
        }),
        { title: figure }
      );

  return [
    filterByFigureAndPeriod("common-outstanding-basic", "FY", aggregatedShares),
    filterByFigureAndPeriod(
      "common-outstanding-diluted",
      "FY",
      aggregatedShares
    ),
  ];
};

const isolateShares = (years, aggregatedShares) => {
  const explore = (name, aggregatedShares) =>
    aggregatedShares
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
        [n]: aggregatedShares.filter((s) => s[name] === n).length,
      }));

  return {
    figures: explore("figure", aggregatedShares),
    types: explore("type", aggregatedShares),
    periods: explore("period", aggregatedShares),
    measures: explore("measure", aggregatedShares),
  };
};

const financialTableMap = (years, yearlyFinancials) => {

    const addRowPrior = [
        {
            to: 'Cash, Cash Equivalents & Short Term Investments',
            row: {
                title: 'Assets'
            },
        },
        {
            to: 'Payables & Accruals',
            row: {
                title: 'Liabilities'
            },
        }
    ]

  return Object.getOwnPropertyNames(yearlyFinancials).reduce(
    (acc, key, i) => ({
      ...acc,
      [key]: yearlyFinancials[key]
        .filter((dataPoint) => dataPoint.value.find((e) => Number(e)))
        .reduce((acc, dataPoint, i) => {
          if (dataPoint.displayLevel === "0") {

            const rowPrior = addRowPrior.find((r) => r.to === dataPoint.standardisedName);

            return [
                ...acc,
                ...(typeof rowPrior !== 'undefined') ? [rowPrior.row] : [],
                dataPointValuesToTableRow(dataPoint, years)
            ];
          } else if (dataPoint.displayLevel === "1") {
            return [
              ...acc.map((tableRow, i) => {
                if (i === acc.length - 1) {
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
};

const dataPointValuesToTableRow = (dataPoint, years) => {
  const totalTypeRows = [
    "Gross Profit",
    "Operating Income (Loss)",
    "Pretax Income (Loss)",
    "Net Income Available to Common Shareholders",
    "Total Current Assets",
    "Total Noncurrent Assets",
    "Total Assets",
    "Total Current Liabilities",
    "Total Noncurrent Liabilities",
    "Total Liabilities",
    "Total Equity",
    "Total Liabilities & Equity",
    "Cash from Operating Activities",
    "Cash from Investing Activities",
    "Cash from Financing Activities",
    "Net Changes in Cash",
  ];

  return dataPoint.value.reduce(
    (acc, value, i) => ({
      ...acc,
      [`${years[i]}`]: numeral(value).format("(0.00a)"),
    }),
    {
      title: dataPoint.standardisedName,
      subRows: [],
      ...totalTypeRows.includes(dataPoint.standardisedName) ? { type: 'total'} : {}
    }
  );
};

module.exports = {
  priceTableMap,
  financialTableMap,
  outstandingSharesTableMap,
  isolateShares,
};
