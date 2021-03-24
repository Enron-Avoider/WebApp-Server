const numeral = require("numeral");
const math = require("mathjs");

const pipe = require("../utils/pipe");

const { rowKeys, rowKeysPaths } = require("./ours");

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
    { title: "Price" }
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
        title: "Diluted Shares",
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
