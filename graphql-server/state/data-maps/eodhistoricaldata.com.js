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

    const rows =
      Object.entries(yearFormat).length &&
      Object.entries(
        yearFormat[yearRange[yearRange.length - 1]] ||
          yearFormat[yearRange[yearRange.length - 2]]
      ).map(([key, value]) => key);

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

      return [
        {
          title: "outstandingShares",
          ...yearRange.reduce(
            (acc, y) => ({
              ...acc,
              [y]: yearSharesFormat[y],
            }),
            {}
          ),
        },
      ];
    } else {
      return [
        {
          title: "outstandingShares",
          warning: "value for last year only, past years are incorrect",
          ...yearRange.reduce(
            (acc, y) => ({
              ...acc,
              [y]: fundamentalData.SharesStats.SharesOutstanding,
            }),
            {}
          ),
        },
      ];
    }
    // .outstandingShares
    // Financials.commonStockSharesOutstanding
    // Financials.commonStockSharesOutstanding
  })();

  return {
    years: yearRange,
    ...(yearRange.length && {
      pl: convertStatementToTable(
        fundamentalData.Financials.Income_Statement.yearly,
        yearRange
      ),
      bs: convertStatementToTable(
        fundamentalData.Financials.Balance_Sheet.yearly,
        yearRange
      ),
      cf: convertStatementToTable(
        fundamentalData.Financials.Cash_Flow.yearly,
        yearRange
      ),
    }),
    price: [pricesByYear],
    aggregatedShares,
  };
};

module.exports = {
  convertEODFundamentalsToEarlyFinancials,
};
