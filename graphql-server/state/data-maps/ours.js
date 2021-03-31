const rowKeys = {
  pl: [
    {
      title: "Total Revenue",
      oldTitle: "totalRevenue",
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
      title: "Other Income (Expense)",
      oldTitle: "totalOtherIncomeExpenseNet",
    },
    {
      title: "EBIT",
      oldTitle: "ebit",
    },
    {
      title: "Net Interest Income",
      oldTitle: "netInterestIncome",
      subRows: [
        {
          title: "Interest Expense",
          oldTitle: "interestExpense",
        },
        {
          title: "Interest Income",
          oldTitle: "interestIncome",
        },
      ],
    },
    {
      title: "Pretax Income",
      oldTitle: "incomeBeforeTax",
    },
    {
      title: "Income Tax Expense",
      oldTitle: "incomeTaxExpense",
      subRows: [
        {
          title: "Tax Provision",
          oldTitle: "taxProvision",
        },
      ],
    },
    {
      title: "Net Income",
      oldTitle: "netIncome",
      subRows: [
        {
          title: "Net Income from Continuing Operations",
          oldTitle: "netIncomeFromContinuingOps",
        },
        {
          title: "Net Income Avail. to Common Stockholders",
          oldTitle: "netIncomeApplicableToCommonShares",
        },
        {
          title: "Minority Interest",
          oldTitle: "minorityInterest",
        },
      ],
    },
    {
      title: "Not Used",
      subRows: [
        {
          title: "effectOfAccountingCharges",
          oldTitle: "effectOfAccountingCharges",
        },
        {
          title: "nonOperatingIncomeNetOther",
          oldTitle: "nonOperatingIncomeNetOther",
        },
        {
          title: "extraordinaryItems",
          oldTitle: "extraordinaryItems",
        },
        {
          title: "nonRecurring",
          oldTitle: "nonRecurring",
        },
        {
          title: "otherItems",
          oldTitle: "otherItems",
        },
        {
          title: "discontinuedOperations",
          oldTitle: "discontinuedOperations",
        },
        {
          title: "preferredStockAndOtherAdjustments",
          oldTitle: "preferredStockAndOtherAdjustments",
        },
      ],
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
          subRows: [
            {
              title: "Cash, Cash Equivalents & Short Term Investments",
              oldTitle: "cashAndShortTermInvestments",
              subRows: [
                {
                  title: "Short Term Investments",
                  oldTitle: "shortTermInvestments",
                },
                {
                  title: "Cash and Equivalents",
                  oldTitle: "cash",
                },
              ],
            },
            {
              title: "Receivables",
              oldTitle: "netReceivables",
            },
            {
              title: "Inventory",
              oldTitle: "inventory",
            },
            {
              title: "Other Current Assets",
              oldTitle: "otherCurrentAssets",
            },
          ],
        },
        {
          title: "Long Term assets",
          oldTitle: "nonCurrentAssetsTotal",
          subRows: [
            {
              title: "Property Plant Equipment Net",
              oldTitle: "propertyPlantEquipment",
              subRows: [
                {
                  title: "Property Plant Equipment Gross",
                  oldTitle: "propertyPlantAndEquipmentGross",
                },
                {
                  title: "Accumulated Depreciation",
                  oldTitle: "accumulatedDepreciation",
                },
                {
                  title: "Accumulated Amortization",
                  oldTitle: "accumulatedAmortization",
                },
              ],
            },
            {
              title: "GoodWill",
              oldTitle: "goodWill",
              subRows: [
                {
                  title: "Negative Goodwill",
                  oldTitle: "negativeGoodwill",
                },
              ],
            },
            {
              title: "Intangible Assets",
              oldTitle: "intangibleAssets",
            },
            {
              title: "Long Term Investments",
              oldTitle: "longTermInvestments",
            },
            {
              title: "Earning Assets",
              oldTitle: "earningAssets",
            },
            {
              title: "Other Long Term Assets",
              oldTitle: "nonCurrrentAssetsOther",
            },
          ],
        },
        {
          title: "Other Assets",
          oldTitle: "otherAssets",
        },
      ],
    },
    {
      title: "Liabilities",
      oldTitle: "totalLiab",
      subRows: [
        {
          title: "Current Liabilities",
          oldTitle: "totalCurrentLiabilities",
          subRows: [
            {
              title: "Accounts Payable and Accrued Expenses",
              oldTitle: "accountsPayable",
            },
            {
              title: "Short Term Debpt",
              oldTitle: "shortTermDebt",
            },
            {
              title: "Other Current Liabilities",
              oldTitle: "otherCurrentLiab",
            },
          ],
        },
        {
          title: "Long Term Liabilities",
          oldTitle: "nonCurrentLiabilitiesTotal",
          subRows: [
            {
              title: "Long Term Debt",
              oldTitle: "longTermDebtTotal",
            },
            {
              title: "Capital Lease Obligations",
              oldTitle: "capitalLeaseObligations",
            },
            {
              title: "Other Long Term Liabilities",
              oldTitle: "nonCurrentLiabilitiesOther",
            },
            {
              title: "Deferred Long Term Liab",
              oldTitle: "deferredLongTermLiab",
            },
            {
              title: "Deferred Long Term Asset Charges",
              oldTitle: "deferredLongTermAssetCharges",
            },
          ],
        },
        {
          title: "Other Liabilities",
          oldTitle: "otherLiab",
        },
      ],
    },
    {
      title: "Equity",
      oldTitle: "totalStockholderEquity",
      subRows: [
        {
          title: "Common Stock",
          oldTitle: "commonStock",
          subRows: [
            {
              title: "Common Stock Shares Outstanding",
              oldTitle: "commonStockSharesOutstanding",
            },
          ],
        },
        {
          title: "Retained Earnings",
          oldTitle: "retainedEarnings",
        },
        {
          title: "Capital Surplus",
          oldTitle: "capitalSurpluse",
        },
        {
          title: "Additional Paid In Capital",
          oldTitle: "additionalPaidInCapital",
        },
        {
          title: "Accumulated Other Comprehensive Income",
          oldTitle: "accumulatedOtherComprehensiveIncome",
        },
        {
          title: "Preferred Stock Total Equity",
          oldTitle: "preferredStockTotalEquity",
          subRows: [
            {
              title: "Preferred Stock Redeemable",
              oldTitle: "preferredStockRedeemable",
            },
          ],
        },
        {
          title: "Treasury Stock",
          oldTitle: "treasuryStock",
        },
        {
          title: "Total Permanent Equity",
          oldTitle: "totalPermanentEquity",
        },
        {
          title: "Warrants",
          oldTitle: "warrants",
        },
        {
          title: "Non Controlling Interest In Consolidated Entity",
          oldTitle: "noncontrollingInterestInConsolidatedEntity",
          subRows: [
            {
              title: "Temporary Equity Redeemable Non Controlling Interests",
              oldTitle: "temporaryEquityRedeemableNoncontrollingInterests",
            },
          ],
        },
        {
          title: "Other Stockholder Equity",
          oldTitle: "otherStockholderEquity",
        },
      ],
    },
    {
      title: "Net Tangible Assets",
      oldTitle: "netTangibleAssets",
    },
    {
      title: "Not Used",
      subRows: [
        {
          title: "Common Stock Total Equity",
          oldTitle: "commonStockTotalEquity",
        },
        {
          title: "Retained Earnings Total Equity",
          oldTitle: "retainedEarningsTotalEquity",
        },
        {
          title: "longTermDebt",
          oldTitle: "longTermDebt",
        },
        {
          title: "shortLongTermDebt",
          oldTitle: "shortLongTermDebt",
        },
        {
          title: "shortLongTermDebtTotal",
          oldTitle: "shortLongTermDebtTotal",
        },
        {
          title: "liabilitiesAndStockholdersEquity",
          oldTitle: "liabilitiesAndStockholdersEquity",
        },
      ],
    },
  ],
  cf: [
    {
      title: "Operating Cash Flow",
      oldTitle: "totalCashFromOperatingActivities",
      subRows: [
        {
          title: "Net Income",
          oldTitle: "netIncome",
        },
        {
          title: "Depreciation",
          oldTitle: "depreciation",
        },
        {
          title: "Change To Inventory",
          oldTitle: "changeToInventory",
        },
        {
          title: "Change To Account Receivables",
          oldTitle: "changeToAccountReceivables",
        },
        {
          title: "Change To Operating Activities",
          oldTitle: "changeToOperatingActivities",
        },
        {
          title: "Other Operating Cash Flows",
          oldTitle: "cashFlowsOtherOperating",
        },
      ],
    },
    {
      title: "Investing Cash Flow",
      oldTitle: "totalCashflowsFromInvestingActivities",
      subRows: [
        {
          title: "Capital Expenditures",
          oldTitle: "capitalExpenditures",
        },
        {
          title: "Investments",
          oldTitle: "investments",
        },
        {
          title: "Other Cash Flows From Investing Activities",
          oldTitle: "otherCashflowsFromInvestingActivities",
        },
      ],
    },
    {
      title: "Financing Cash Flow",
      oldTitle: "totalCashFromFinancingActivities",
      subRows: [
        {
          title: "Dividends Paid",
          oldTitle: "dividendsPaid",
        },
        {
          title: "Sale (Purchase) Of Stock",
          oldTitle: "salePurchaseOfStock",
        },
        {
          title: "Cash And Cash Equivalents Changes",
          oldTitle: "cashAndCashEquivalentsChanges",
        },
        {
          title: "Other Cash Flows From Financing Activities",
          oldTitle: "otherCashflowsFromFinancingActivities",
        },
        {
          title: "Exchange Rate Changes",
          oldTitle: "exchangeRateChanges",
        },
      ],
    },

    {
      title: "End Cash Position",
      oldTitle: "endPeriodCashFlow",
      subRows: [
        {
          title: "Change In Cash",
          oldTitle: "changeInCash",
        },
        {
          title: "Beginning Cash Position",
          oldTitle: "beginPeriodCashFlow",
        },
      ],
    },
    {
      title: "Not Used",
      subRows: [
        {
          title: "changeToNetincome",
          oldTitle: "changeToNetincome",
        },
        {
          title: "changeReceivables",
          oldTitle: "changeReceivables",
        },
        {
          title: "netBorrowings",
          oldTitle: "netBorrowings",
        },
        {
          title: "changeToLiabilities",
          oldTitle: "changeToLiabilities",
        },
      ],
    },
  ],
  aggregatedShares: [
    {
      title: "Diluted Shares",
      oldTitle: "",
    },
  ],
  price: [
    {
      title: "Price",
      oldTitle: "",
    },
  ],
  marketCap: [
    {
      title: "Market Cap",
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

module.exports = {
  rowKeys,
  rowKeysPaths,
};
