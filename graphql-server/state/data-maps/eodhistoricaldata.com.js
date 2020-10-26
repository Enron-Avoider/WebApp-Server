const numeral = require("numeral");
const math = require("mathjs");

const convertEODFundamentalsToEarlyFinancials = (financials, priceData) => {
  // TODO: Get longest range out of all financials
  const yearRange = Object.keys(financials.Balance_Sheet.yearly)
    .map((y) => y.substring(0, 4))
    .reverse();

  const convertStatementToTable = (statement) => {
    const yearFormat = Object.entries(statement).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.substring(0, 4)]: value,
      }),
      {}
    );

    const rows = Object.entries(
      yearFormat[yearRange[yearRange.length - 1]]
    ).map(([key, value]) => key);

    const tableFormat = rows.map((r) => ({
      row: r,
      ...yearRange.reduce(
        (acc, y) => ({
          ...acc,
          [y]: yearFormat[y] && yearFormat[y][r],
        }),
        {}
      ),
    }));

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
    {}
  );

  return {
    years: yearRange,
    pl: convertStatementToTable(financials.Income_Statement.yearly),
    bs: convertStatementToTable(financials.Balance_Sheet.yearly),
    cf: convertStatementToTable(financials.Cash_Flow.yearly),
    price: [pricesByYear],
  };
};

module.exports = {
  convertEODFundamentalsToEarlyFinancials,
};
