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
