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
    {
      title: "TODO: Not Organized Yet",
      subRows: [
        {
          title: "effectOfAccountingCharges",
          oldTitle: "effectOfAccountingCharges",
        },
        {
          title: "minorityInterest",
          oldTitle: "minorityInterest",
        },
        {
          title: "nonOperatingIncomeNetOther",
          oldTitle: "nonOperatingIncomeNetOther",
        },
        {
          title: "interestExpense",
          oldTitle: "interestExpense",
        },
        {
          title: "interestIncome",
          oldTitle: "interestIncome",
        },
        {
          title: "netInterestIncome",
          oldTitle: "netInterestIncome",
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
          title: "incomeTaxExpense",
          oldTitle: "incomeTaxExpense",
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
                  title: "Cash",
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
          title: "Non-current assets",
          oldTitle: "nonCurrentAssetsTotal",
          subRows: [
            {
              title: "Property Plant Equipment",
              oldTitle: "propertyPlantEquipment",
            },
            {
              title: "GoodWill",
              oldTitle: "goodWill",
            },
            {
              title: "Intangible Assets",
              oldTitle: "intangibleAssets",
            },
            {
              title: "Accumulated Depreciation",
              oldTitle: "accumulatedDepreciation",
            },
            {
              title: "Long Term Investments",
              oldTitle: "longTermInvestments",
            },
            {
              title: "Other Non Current Assets",
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
              title: "Accounts Payable",
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
          title: "Non-current Liabilities",
          oldTitle: "nonCurrentLiabilitiesTotal",
          subRows: [
            {
              title: "Deferred Long Term Liab",
              oldTitle: "deferredLongTermLiab",
            },
            {
              title: "Deferred Long Term Asset Charges",
              oldTitle: "deferredLongTermAssetCharges",
            },
            {
              title: "Long Term Debt",
              oldTitle: "longTermDebt",
            },
            {
              title: "Long Term Debt",
              oldTitle: "longTermDebtTotal",
            },
            {
              title: "Other Non Current Liabilities",
              oldTitle: "nonCurrentLiabilitiesOther",
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
        },
        {
          title: "Retained Earnings",
          oldTitle: "retainedEarnings",
        },
        {
          title: "Retained Earnings Total Equity",
          oldTitle: "retainedEarningsTotalEquity",
        },
        {
          title: "Common Stock Total Equity",
          oldTitle: "commonStockTotalEquity",
        },
        {
          title: "Preferred Stock Total Equity",
          oldTitle: "preferredStockTotalEquity",
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
      title: "TODO: Not Organized Yet",
      subRows: [
        {
          title: "Property Plant Equipment Gross",
          oldTitle: "propertyPlantAndEquipmentGross",
        },
        {
          title: "earningAssets",
          oldTitle: "earningAssets",
        },
        {
          title: "shortTermDebt",
          oldTitle: "shortTermDebt",
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
          title: "noncontrollingInterestInConsolidatedEntity",
          oldTitle: "noncontrollingInterestInConsolidatedEntity",
        },
        {
          title: "temporaryEquityRedeemableNoncontrollingInterests",
          oldTitle: "temporaryEquityRedeemableNoncontrollingInterests",
        },
        {
          title: "accumulatedOtherComprehensiveIncome",
          oldTitle: "accumulatedOtherComprehensiveIncome",
        },
        {
          title: "additionalPaidInCapital",
          oldTitle: "additionalPaidInCapital",
        },
        {
          title: "accumulatedAmortization",
          oldTitle: "accumulatedAmortization",
        },
        {
          title: "capitalLeaseObligations",
          oldTitle: "capitalLeaseObligations",
        },
        {
          title: "negativeGoodwill",
          oldTitle: "negativeGoodwill",
        },
        {
          title: "warrants",
          oldTitle: "warrants",
        },
        {
          title: "preferredStockRedeemable",
          oldTitle: "preferredStockRedeemable",
        },
        {
          title: "capitalSurpluse",
          oldTitle: "capitalSurpluse",
        },
        {
          title: "liabilitiesAndStockholdersEquity",
          oldTitle: "liabilitiesAndStockholdersEquity",
        },
        {
          title: "commonStockSharesOutstanding",
          oldTitle: "commonStockSharesOutstanding",
        },
      ],
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
    // "totalCashFromOperatingActivities": "66064000000.00",
    // "depreciation": "25251000000.00",
    // "otherCashflowsFromInvestingActivities": "2771000000.00",
    // "dividendsPaid": null,
    // "changeToInventory": "-2849000000.00",
    // "changeToAccountReceivables": "-8169000000.00",
    // "otherCashflowsFromFinancingActivities": "-10076000000.00",
    // "changeToNetincome": "6001000000.00",
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
      title: "Capital Expenditures",
      oldTitle: "capitalExpenditures",
    },
    {
      title: "Sale/Purchase Of Stock",
      oldTitle: "salePurchaseOfStock",
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
