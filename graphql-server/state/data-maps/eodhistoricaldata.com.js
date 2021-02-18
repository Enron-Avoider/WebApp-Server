const numeral = require("numeral");
const math = require("mathjs");

const pipe = require("../utils/pipe");

const rowKeys = {
  pl: [
    {
      title: "Total Revenue",
      oldTitle: "totalRevenue",
      // subRows: []
    },
    {
      title: "Cost of Revenue",
      oldTitle: "costOfRevenue",
    },
    {
      title: "Gross Profit",
      oldTitle: "grossProfit",
    },
    {
      title: "Operating Expenses",
      oldTitle: "totalOperatingExpenses",
    },
    {
      title: "Operating Income",
      oldTitle: "operatingIncome",
    },
    {
      title: "Net Non Operating Interest",
      oldTitle: "netInterestIncome",
    },
    {
      title: "Other Income Expense",
      oldTitle: "totalOtherIncomeExpenseNet",
    },
    {
      title: "Pretax Income",
      oldTitle: "incomeBeforeTax",
    },
    {
      title: "Tax Provision",
      oldTitle: "taxProvision",
    },
    {
      title: "Net Income Common Stockholders",
      oldTitle: "netIncomeApplicableToCommonShares",
    },
    {
      title: "EBIT",
      oldTitle: "ebit",
    },
  ],
  bs: [
    {
      title: "Assets",
      oldTitle: "totalAssets",
      subRows: [
        {
          title: "Current Assets",
          oldTitle: "totalCurrentAssets",
        },
        {
          title: "Non-current assets",
          oldTitle: "nonCurrentAssetsTotal",
        },
      ],
    },
    {
      title: "Liabilities",
      oldTitle: "totalLiab",
      subRows: [
        {
          title: "Current Assets",
          oldTitle: "totalCurrentLiabilities",
        },
        {
          title: "Non-current Liabilities",
          oldTitle: "nonCurrentLiabilitiesTotal",
        },
      ],
    },
    {
      title: "Equity",
      oldTitle: "totalStockholderEquity",
    },
  ],
  cf: [
    {
      title: "Operating Cash Flow",
      oldTitle: "totalCashFromOperatingActivities",
    },
    {
      title: "Investing Cash Flow",
      oldTitle: "totalCashflowsFromInvestingActivities",
    },
    {
      title: "Financing Cash Flow",
      oldTitle: "totalCashFromFinancingActivities",
    },
  ],
  aggregatedShares: [
    {
      title: "outstandingShares",
      oldTitle: "",
    },
  ],
  price: [
    {
      title: "price",
      oldTitle: "",
    },
  ],
};

const rowKeysPaths = [
  ...Object.keys(rowKeys)
    .reduce((p, table) => [...p, table], [])
    .reduce(
      (p, k) => [
        ...p,
        ...rowKeys[k].reduce(
          (p_, r) => [
            ...p_,
            `${k}.${r.title}`,
            ...(r.subRows
              ? r.subRows.reduce(
                  (p, r_) => [...p, `${k}.${r.title}.subRows.${r_.title}`],
                  []
                )
              : []),
          ],
          []
        ),
      ],
      []
    ),
];

const convertEODFundamentalsToEarlyFinancials = (
  fundamentalData,
  priceData,
  yearlyCurrencyPairs
) => {
  // TODO: Get longest range out of all financials
  const yearRange = Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
    .length
    ? Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
        .map((y) => y.substring(0, 4))
        .filter((value, index, self) => self.indexOf(value) === index)
        .reverse()
    : [];

  const convertStatementToTable = (statement, yearRange) => {
    const yearFormat = Object.entries(statement).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.substring(0, 4)]: value,
      }),
      {}
    );

    const lastYearInStatement = Object.keys(yearFormat)[
      Object.keys(yearFormat).length - 1
    ];

    const rows =
      Object.entries(yearFormat).length &&
      Object.entries(yearFormat[lastYearInStatement]).map(
        ([key, value]) => key
      );

    const tableFormat = rows
      ? rows.map((r) => ({
          title: r,
          ...yearRange.reduce(
            (acc, y) => ({
              ...acc,
              [y]: yearFormat[y] ? yearFormat[y][r] : null,
            }),
            {}
          ),
        }))
      : [];

    return tableFormat;
  };

  const convertCurrencyInTable = (table, yearlyCurrencyPairs) => {
    return table.map((r) => ({
      ...r,
      ...Object.entries(r).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: isNaN(value)
            ? value
            : Number(value) * Number(yearlyCurrencyPairs.perYear[key]),
        }),
        {}
      ),
    }));
  };

  const organizeTable = (statement, statementKey) => {
    return [
      ...rowKeys[statementKey].map((row) => ({
        ...statement.find((row2) => row2.title === row.oldTitle),
        title: row.title,
        EODTitle: row.oldTitle,
        ...(row.type && { type: row.type }),
        ...(row.subRows && {
          subRows: row.subRows.map((row3) => ({
            ...statement.find((row2) => row2.title === row3.oldTitle),
            title: row3.title,
            EODTitle: row3.oldTitle,
          })),
        }),
      })),
      {
        title: "Not Organized Yet",
        ...yearRange.reduce(
          (acc, y) => ({
            ...acc,
            [y]: null,
          }),
          {}
        ),
        subRows: [
          ...statement.filter(
            (row) =>
              !rowKeys[statementKey]
                .reduce(
                  (acc, row2) => [
                    ...acc,
                    { ...row2 },
                    ...(row2.subRows ? row2.subRows : []),
                  ],
                  []
                )
                .find((row2) => row2.oldTitle === row.tile)
          ),
        ],
      },
    ];
  };

  const pricesByYear = yearRange.reduce(
    (acc, y) => ({
      ...acc,
      [y]: (() => {
        const yearPrices = priceData.filter((p) => p.date.includes(y));

        const lastYearPrice =
          yearPrices.length &&
          yearPrices.reduce(function (prev, current) {
            return prev.date > current.date ? prev : current;
          });

        return yearPrices.length ? lastYearPrice.close : null;
      })(),
    }),
    { title: "price" }
  );

  const aggregatedShares = (() => {
    if (Object.keys(fundamentalData.outstandingShares.annual).length) {
      const yearSharesFormat = Object.entries(
        fundamentalData.outstandingShares.annual
      ).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [value.date]: value.shares,
        }),
        {}
      );

      return {
        title: "outstandingShares",
        ...yearRange.reduce(
          (acc, y) => ({
            ...acc,
            [y]: yearSharesFormat[y],
          }),
          {}
        ),
      };
    } else {
      return {
        title: "outstandingShares",
        warning: "value for last year only, past years are incorrect",
        ...yearRange.reduce(
          (acc, y) => ({
            ...acc,
            [y]: fundamentalData.SharesStats.SharesOutstanding,
          }),
          {}
        ),
      };
    }
    // .outstandingShares
    // Financials.commonStockSharesOutstanding
    // Financials.commonStockSharesOutstanding
  })();

  const marketCap = yearRange.reduce(
    (acc, y) => ({
      ...acc,
      [y]: (() => pricesByYear[y] * aggregatedShares[y])(),
    }),
    { title: "Market Cap" }
  );

  return {
    years: yearRange,
    ...(yearRange.length
      ? [
          ["pl", "Income_Statement"],
          ["bs", "Balance_Sheet"],
          ["cf", "Cash_Flow"],
        ].reduce(
          (p, [statementShortName, statementInEOD]) => ({
            ...p,
            [statementShortName]: pipe(
              () => ({
                f: fundamentalData.Financials[statementInEOD].yearly,
                y: yearRange,
              }),
              ({ f, y }) => convertStatementToTable(f, y),
              (table) => convertCurrencyInTable(table, yearlyCurrencyPairs),
              (table) => organizeTable(table, statementShortName)
            )(),
          }),
          {}
        )
      : []),
    price: convertCurrencyInTable([pricesByYear], yearlyCurrencyPairs),
    aggregatedShares: [aggregatedShares],
    marketCap: convertCurrencyInTable([marketCap], yearlyCurrencyPairs),
  };
};

const yearlyFinancialsWithKeys = (yearlyFinancials) =>
  Object.entries(yearlyFinancials).reduce(
    (p, [k, v]) => ({
      ...p,
      [k]:
        k === "years"
          ? v
          : v.reduce(
              (p, c) => ({
                ...p,
                [c.title]: {
                  ...c,
                  ...(c.subRows && {
                    subRows: c.subRows.reduce(
                      (p_, c_) => ({
                        ...p_,
                        [c_.title]: c_,
                      }),
                      {}
                    ),
                  }),
                },
              }),
              {}
            ),
    }),
    {}
  );

const yearlyFinancialsFlatByYear = (yearlyFinancialsWithKeys) => {
  //   const keys = Object.entries(yearlyFinancials).reduce(
  //     (p, [k, v]) => [
  //       ...p,
  //       ...(k === "years"
  //         ? []
  //         : v.reduce(
  //             (p, c) => [
  //               ...p,
  //               [k, c.title],
  //               ...(c.subRows
  //                 ? c.subRows.reduce(
  //                     (p_, c_) => [...p_, [k, c.title, c_.title]],
  //                     []
  //                   )
  //                 : []),
  //             ],
  //             []
  //           )),
  //     ],
  //     //   [k]:
  //     //     k === "years"
  //     //       ? v
  //     //       : v.reduce(
  //     //           (p, c) => [
  //     //             ...p,
  //     //             {
  //     //               ...c,
  //     //               ...(c.subRows && {
  //     //                 subRows: c.subRows.reduce(
  //     //                   (p_, c_) => [
  //     //                     ...p_,
  //     //                     { ...c_ },
  //     //                   ],
  //     //                   []
  //     //                 ),
  //     //               }),
  //     //             },
  //     //           ],
  //     //           []
  //     //         ),
  //     // }),
  //     []
  //   );

  //   const res = yearlyFinancials.years.map((year) => ({
  //     year,
  //     ...keys.reduce(
  //       (p, k) => ({
  //         ...p,
  //         [k.reduce(
  //           (p, c, i) => `${p}${i > 0 ? "." : ""}${i === 2 ? "subRows." : ""}${c}`
  //         )]:
  //           k.length === 2
  //             ? yearlyFinancialsWithKeys[k[0]][k[1]][year] || 0
  //             : k.length === 3
  //             ? yearlyFinancialsWithKeys[k[0]][k[1]].subRows[k[2]][year] || 0
  //             : null,
  //       }),
  //       {}
  //     ),
  //   }));

  const res2 = yearlyFinancialsWithKeys.years.map((year) => ({
    year,
    ...Object.entries(yearlyFinancialsWithKeys).reduce(
      (p, [k, v]) => ({
        ...p,
        ...(k !== "years" && {
          [k]: Object.entries(v).reduce(
            (p_, [k_, v_]) => ({
              ...p_,
              [k_]: {
                v: yearlyFinancialsWithKeys[k][k_][year] || 0,
                ...(v_.subRows && {
                  subRows: Object.entries(v_.subRows).reduce(
                    (p__, [k__, v__]) => ({
                      ...p__,
                      [k__]: {
                        v:
                          yearlyFinancialsWithKeys[k][k_].subRows[k__][year] ||
                          0,
                      },
                    }),
                    {}
                  ),
                }),
              },
            }),
            {}
          ),
        }),

        // k === "years"
        //   ? {}
        //   : v.reduce(
        //       (p, c) => [
        //         ...p,
        //         {
        //           ...c,
        //           ...(c.subRows && {
        //             subRows: c.subRows.reduce(
        //               (p_, c_) => [...p_, { ...c_ }],
        //               []
        //             ),
        //           }),
        //         },
        //       ],
        //       {}
        //     ),
      }),
      {}
    ),
  }));

  return res2;
};

module.exports = {
  rowKeys,
  rowKeysPaths,
  convertEODFundamentalsToEarlyFinancials,
  yearlyFinancialsWithKeys,
  yearlyFinancialsFlatByYear,
};
