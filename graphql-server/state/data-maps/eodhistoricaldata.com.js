const numeral = require("numeral");
const math = require("mathjs");

const convertEODFundamentalsToEarlyFinancials = (
  fundamentalData,
  priceData
) => {
  // TODO: Get longest range out of all financials
  const yearRange = Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
    .length
    ? Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
        .map((y) => y.substring(0, 4))
        .filter((value, index, self) => self.indexOf(value) === index)
        .reverse()
    : [];

  //   console.log({ yearRange });

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

  const convertToUSD = () => {
    // TODO!!
    // get currency - USD convertion for the period
    // convert
  };

  const organizeTable = (statement, statementKey) => {
    const maps = {
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
    };

    return [
      ...maps[statementKey].map((row) => ({
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
              !maps[statementKey]
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
    ...(yearRange.length && {
      pl: ((table) => organizeTable(table, "pl"))(
        convertStatementToTable(
          fundamentalData.Financials.Income_Statement.yearly,
          yearRange
        )
      ),
      bs: ((table) => organizeTable(table, "bs"))(
        convertStatementToTable(
          fundamentalData.Financials.Balance_Sheet.yearly,
          yearRange
        )
      ),
      cf: ((table) => organizeTable(table, "cf"))(
        convertStatementToTable(
          fundamentalData.Financials.Cash_Flow.yearly,
          yearRange
        )
      ),
    }),
    price: [pricesByYear],
    aggregatedShares: [aggregatedShares],
    marketCap: [marketCap]
  };
};

const yearlyFinancialsWithKeys = (yearlyFinancials) => Object.entries(yearlyFinancials).reduce(
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
                    subRows: c.subRows.reduce((p_, c_) => ({
                      ...p_,
                      [c_.title]: c_,
                    })),
                  }),
                },
              }),
              {}
            ),
    }),
    {}
  );

module.exports = {
  convertEODFundamentalsToEarlyFinancials,
  yearlyFinancialsWithKeys
};
