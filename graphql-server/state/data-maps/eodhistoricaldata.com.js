const numeral = require("numeral");
const math = require("mathjs");

const pipe = require("../utils/pipe");

const rowKeys = {
  pl: [
    // "effectOfAccountingCharges": null,
    // "minorityInterest": null,
    // "nonOperatingIncomeNetOther": "2942000000.00",
    // "interestExpense": "1647000000.00", !!
    // "interestIncome": "555000000.00", !!
    // "netInterestIncome": "-1092000000.00", !!
    // "extraordinaryItems": null,
    // "nonRecurring": null,
    // "otherItems": null,
    // "incomeTaxExpense": "2863000000.00",
    // "discontinuedOperations": null,
    // "preferredStockAndOtherAdjustments": null

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
      subRows: [
        {
          title: "Selling General and Administrative",
          oldTitle: "sellingGeneralAdministrative",
        },
        {
          title: "Research & Development",
          oldTitle: "researchDevelopment",
        },
        {
          title: "Other Operating Expenses",
          oldTitle: "otherOperatingExpenses",
        },
      ],
    },
    {
      title: "Operating Income",
      oldTitle: "operatingIncome",
    },
    {
      title: "Net Non Operating Interest",
      oldTitle: "netInterestIncome",
      subRows: [
        {
          title: "Interest Income Non Operating",
          oldTitle: "interestIncome",
        },
        {
          title: "Interest Expense Non Operating",
          oldTitle: "interestExpense",
        },
      ],
    },
    {
      title: "Other Income Expense",
      oldTitle: "totalOtherIncomeExpenseNet",
      subRows: [
        {
          title: "Interest Income Non Operating",
          oldTitle: "interestIncome",
        },
        {
          title: "Interest Expense Non Operating",
          oldTitle: "interestExpense",
        },
      ],
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
        title: "Net Income",
        oldTitle: "netIncome",
    },
    {
      title: "EBIT",
      oldTitle: "ebit",
    },
    {
      title: "Net Income from Continuing Operations",
      oldTitle: "netIncomeFromContinuingOps",
    },
    // netIncomeFromContinuingOps
  ],
  bs: [

    // "intangibleAssets": "4981000000.00",
    // "earningAssets": null,
    // "otherCurrentAssets": "233000000.00",
    // "totalStockholderEquity": "93404000000.00",
    // "deferredLongTermLiab": null,
    // "otherCurrentLiab": "9708000000.00",
    // "commonStock": "5000000.00",
    // "retainedEarnings": "52551000000.00",
    // "otherLiab": "17017000000.00",
    // "goodWill": "15017000000.00",
    // "otherAssets": "12097000000.00",
    // "cash": "42122000000.00",
    // "totalCurrentLiabilities": "126385000000.00",
    // "shortTermDebt": null,
    // "shortLongTermDebt": null,
    // "shortLongTermDebtTotal": null,
    // "otherStockholderEquity": "-180000000.00",
    // "propertyPlantEquipment": "150667000000.00",
    // "totalCurrentAssets": "132733000000.00",
    // "longTermInvestments": null,
    // "netTangibleAssets": "130960000000.00",
    // "shortTermInvestments": "42274000000.00",
    // "netReceivables": "24542000000.00",
    // "longTermDebt": "31816000000.00",
    // "inventory": "23795000000.00",
    // "accountsPayable": "116677000000.00",
    // "totalPermanentEquity": null,
    // "noncontrollingInterestInConsolidatedEntity": null,
    // "temporaryEquityRedeemableNoncontrollingInterests": null,
    // "accumulatedOtherComprehensiveIncome": null,
    // "additionalPaidInCapital": null,
    // "commonStockTotalEquity": "5000000.00",
    // "preferredStockTotalEquity": null,
    // "retainedEarningsTotalEquity": "52551000000.00",
    // "treasuryStock": "-1837000000.00",
    // "accumulatedAmortization": null,
    // "nonCurrrentAssetsOther": "173445000000.00",
    // "deferredLongTermAssetCharges": null,
    // "nonCurrentAssetsTotal": "188462000000.00",
    // "capitalLeaseObligations": "52573000000.00",
    // "longTermDebtTotal": "31816000000.00",
    // "nonCurrentLiabilitiesOther": "17017000000.00",
    // "nonCurrentLiabilitiesTotal": "48833000000.00",
    // "negativeGoodwill": null,
    // "warrants": null,
    // "preferredStockRedeemable": null,
    // "capitalSurpluse": "42865000000.00",
    // "liabilitiesAndStockholdersEquity": "321195000000.00",
    // "cashAndShortTermInvestments": "84396000000.00",
    // "propertyPlantAndEquipmentGross": null,
    // "accumulatedDepreciation": null,
    // "commonStockSharesOutstanding": "503000000.00"



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

    // "investments": "-22242000000.00",
    // "changeToLiabilities": "23234000000.00",
    // "totalCashflowsFromInvestingActivities": "-59611000000.00",
    // "netBorrowings": "8972000000.00",
    // "totalCashFromFinancingActivities": "-1104000000.00",
    // "changeToOperatingActivities": "5754000000.00",
    // "netIncome": "21331000000.00",
    // "changeInCash": "5349000000.00",
    // "beginPeriodCashFlow": "36410000000.00",
    // "endPeriodCashFlow": "42377000000.00",
    // "totalCashFromOperatingActivities": "66064000000.00",
    // "depreciation": "25251000000.00",
    // "otherCashflowsFromInvestingActivities": "2771000000.00",
    // "dividendsPaid": null,
    // "changeToInventory": "-2849000000.00",
    // "changeToAccountReceivables": "-8169000000.00",
    // "salePurchaseOfStock": null,
    // "otherCashflowsFromFinancingActivities": "-10076000000.00",
    // "changeToNetincome": "6001000000.00",
    // "capitalExpenditures": "40140000000",
    // "changeReceivables": "-8169000000.00",
    // "cashFlowsOtherOperating": "1265000000.00",
    // "exchangeRateChanges": "618000000.00",
    // "cashAndCashEquivalentsChanges": "5967000000.00"


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
        title: "Diluted Shares",
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
