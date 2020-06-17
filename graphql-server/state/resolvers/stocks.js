const {
  financialTableMap,
  outstandingSharesTableMap,
  priceTableMap,
  isolateShares,
} = require("../dataMaps");

module.exports = {
  SimfinStock: {      
    shareClasses: async (_source, params, { dataSources }) => {
      const shareClasses = await dataSources.messyFinanceDataAPI.shareClasses(
        _source
      );

      // return shareClasses;
      return await Promise.all(
        shareClasses.map(
          async (s) =>
            await priceTableMap(
              _source.years,
              `price ${s.shareClassName}`,
              await dataSources.messyFinanceDataAPI.pricesForShareClasses({
                simId: _source.simId,
                shareClassId: s.shareClassId,
                years: _source.years,
              })
            )
        )
      );

      // .map(s =>
      //     await priceTableMap(
      //         _source.years,
      //         s.shareClassName,
      //         await dataSources.messyFinanceDataAPI.pricesForShareClasses(
      //             { simId: _source.simId, shareClassId: s.shareClassId, years: _source.years },
      //
      //         )
      //     )
      // ),
    },
    yearlyFinancials: async (_source, params, { dataSources }) => 
        await dataSources.messyFinanceDataAPI.allYearlyFinancials(_source),

    logo: async (_source, params, { dataSources }) => {
      const res = await dataSources.messyFinanceDataAPI.logo(_source);
      return res ? res.url : null;
    },
    sectorAndIndustry: async (_source, params, { dataSources }) => 
        await dataSources.messySectorsAndIndustries.getSectorAndIndustryForStock(_source)
  }
};
