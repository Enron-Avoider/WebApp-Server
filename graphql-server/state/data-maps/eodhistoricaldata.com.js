const pipe = require("../utils/pipe");

const { rowKeys, rowKeysPaths } = require("./ours");

const convertEODFundamentalsToYearlyFinancials = (
  fundamentalData,
  priceData,
  yearlyCurrencyPairsForFundamental,
  yearlyCurrencyPairsForPrice
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

    const lastYearInStatement =
      Object.keys(yearFormat)[Object.keys(yearFormat).length - 1];

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
          [key]:
            isNaN(value) || value === null
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
        ...statement.find(
          (statementRow) => statementRow.title === row.oldTitle
        ),
        title: row.title,
        EODTitle: row.oldTitle,
        // ...(row.type && { type: row.type }),
        ...(row.subRows && {
          subRows: row.subRows.map((row_) => ({
            ...statement.find(
              (statementRow) => statementRow.title === row_.oldTitle
            ),
            title: row_.title,
            EODTitle: row_.oldTitle,
            ...(row_.subRows && {
              subRows: row_.subRows.map((row__) => ({
                ...statement.find(
                  (statementRow) => statementRow.title === row__.oldTitle
                ),
                title: row__.title,
                EODTitle: row__.oldTitle,
                ...(row__.subRows && {
                  subRows: row__.subRows.map((row___) => ({
                    ...statement.find(
                      (statementRow) => statementRow.title === row___.oldTitle
                    ),
                    title: row___.title,
                    EODTitle: row___.oldTitle,
                  })),
                }),
              })),
            }),
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
              (table) =>
                convertCurrencyInTable(
                  table,
                  yearlyCurrencyPairsForFundamental
                ),
              (table) => organizeTable(table, statementShortName)
            )(),
          }),
          {}
        )
      : []),
    price: convertCurrencyInTable([pricesByYear], yearlyCurrencyPairsForPrice),
    aggregatedShares: [aggregatedShares],
    marketCap: convertCurrencyInTable([marketCap], yearlyCurrencyPairsForPrice),
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
                        [c_.title]: {
                          ...c_,
                          ...(c_.subRows && {
                            subRows: c_.subRows.reduce(
                              (p__, c__) => ({
                                ...p__,
                                [c__.title]: {
                                  ...c__,
                                  ...(c__.subRows && {
                                    subRows: c__.subRows.reduce(
                                      (p___, c___) => ({
                                        ...p___,
                                        [c___.title]: c___,
                                      }),
                                      {}
                                    ),
                                  }),
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
                },
              }),
              {}
            ),
    }),
    {}
  );

const yearlyFinancialsFlatByYear = (yearlyFinancialsWithKeys) => {
  const res = yearlyFinancialsWithKeys.years.map((year) => ({
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
                        ...(v__.subRows && {
                          subRows: Object.entries(v__.subRows).reduce(
                            (p___, [k___, v___]) => ({
                              ...p___,
                              [k___]: {
                                v:
                                  yearlyFinancialsWithKeys[k][k_].subRows[k__]
                                    .subRows[k___][year] || 0,
                                ...(v___.subRows && {
                                  subRows: Object.entries(v___.subRows).reduce(
                                    (p____, [k____, v____]) => ({
                                      ...p____,
                                      [k____]: {
                                        v:
                                          yearlyFinancialsWithKeys[k][k_]
                                            .subRows[k__].subRows[k___].subRows[
                                            k____
                                          ][year] || 0,
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
      }),
      {}
    ),
  }));

  return res;
};

const convertEODFundamentalsToDataByYear = (
  fundamentalData,
  priceData,
  yearlyCurrencyPairsForFundamental,
  yearlyCurrencyPairsForPrice
) => {
  // TODO: Get longest range out of all financials
  const yearRange = Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
    .length
    ? Object.keys(fundamentalData.Financials.Balance_Sheet.yearly)
        .map((y) => y.substring(0, 4))
        .filter((value, index, self) => self.indexOf(value) === index)
    : [];

  const convertStatementToByYear = (statement, yearRange) => {
    const yearFormat = Object.entries(statement).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.substring(0, 4)]: value,
      }),
      {}
    );

    const lastYearInStatement =
      Object.keys(yearFormat)[Object.keys(yearFormat).length - 1];

    const rows =
      Object.entries(yearFormat).length &&
      Object.entries(yearFormat[lastYearInStatement]).map(
        ([key, value]) => key
      );

    const newFormat = rows
      ? yearRange.reduce(
          (acc, y) => ({
            ...acc,
            [y]: rows.reduce(
              (acc, r) => ({
                ...acc,
                [r]: yearFormat[y] ? yearFormat[y][r] : null,
              }),
              {}
            ),
          }),
          {}
        )
      : [];

    //   rows.reduce(
    //       (acc, r) => ({
    //         ...acc,
    //         [r]: yearRange.reduce(
    //           (acc, y) => ({
    //             ...acc,
    //             [y]: yearFormat[y] ? yearFormat[y][r] : null,
    //           }),
    //           {}
    //         ),
    //       }),
    //       {}
    //     )
    //   : [];

    return newFormat;
  };

  const statementsByYear = yearRange.length
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
            ({ f, y }) => convertStatementToByYear(f, y)
          )(),
        }),
        {}
      )
    : [];

  const convertCurrencyInTable = (table, yearlyCurrencyPairs) => {
    return table.map((r) => ({
      ...r,
      ...Object.entries(r).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]:
            isNaN(value) || value === null
              ? value
              : Number(value) * Number(yearlyCurrencyPairs.perYear[key]),
        }),
        {}
      ),
    }));
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
    {}
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
        [yearRange[0]]: fundamentalData.SharesStats.SharesOutstanding,
      };
    }
  })();

  const marketCap = yearRange.reduce(
    (acc, y) => ({
      ...acc,
      [y]: (() => pricesByYear[y] * aggregatedShares[y])(),
    }),
    {}
  );

  const stockDataByYear = {
    pricesByYear,
    aggregatedShares,
    marketCap,
    employees: { [yearRange[0]]: fundamentalData.General.FullTimeEmployees },
    providerMarketCap: {
      [yearRange[0]]: fundamentalData.Highlights.MarketCapitalization,
    },
  };

  const flatByYear = yearRange.map((year) => ({
    year,
    EOD: {
      ...Object.keys(stockDataByYear).reduce(
        (acc, k) => ({
          ...acc,
          [k]: stockDataByYear[k][year],
        }),
        {}
      ),
      ...Object.keys(statementsByYear).reduce(
        (acc, k) => ({
          ...acc,
          [k]: statementsByYear[k][year],
        }),
        {}
      ),
    },
  }));

  return {
    flatByYear,
    statementsByYear,
    sharesByYear: {
      pricesByYear,
      aggregatedShares,
      marketCap,
    },
  };
};

module.exports = {
  rowKeys,
  rowKeysPaths,
  convertEODFundamentalsToYearlyFinancials,
  yearlyFinancialsWithKeys,
  yearlyFinancialsFlatByYear,
  convertEODFundamentalsToDataByYear,
};
