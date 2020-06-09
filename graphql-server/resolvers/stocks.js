const { gql } = require("apollo-server");
const GraphQLJSON = require("graphql-type-json");

const {
  financialTableMap,
  outstandingSharesTableMap,
  priceTableMap,
  isolateShares,
} = require("../dataMaps");

module.exports = {
  // JSON: GraphQLJSON,
  SimfinStock: {
    aggregatedShares: async (_source, params, { dataSources }) =>
      outstandingSharesTableMap(
        _source.years,
        await dataSources.messyFinanceDataAPI.aggregatedShares(_source)
      ),

    aggregatedSharesIsolated: async (_source, params, { dataSources }) =>
      isolateShares(
        _source.years,
        await dataSources.messyFinanceDataAPI.aggregatedShares(_source)
      ),

    price: async (_source, params, { dataSources }) => {
      const shareClasses = await dataSources.messyFinanceDataAPI.shareClasses(
        _source
      );

      return await [
        priceTableMap(
          _source.years,
          "price",
          await dataSources.messyFinanceDataAPI.pricesForShareClasses({
            simId: _source.simId,
            shareClassId: shareClasses[0].shareClassId,
            years: _source.years,
          })
        ),
      ];
    },

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

    industryCompanies: async (_source, params, { dataSources }) =>
      (
        await dataSources.messyFinanceDataAPI.getSimfinIndustryCompanies(
          _source.sectorCode
        )
      ).map(async (company) => ({
        years: _source.years,
        ...(await dataSources.messyFinanceDataAPI.getSimfinCompanyById({
          id: company.simId,
        })),
      })),

    yearlyFinancials: async (_source, params, { dataSources }) =>
      financialTableMap(
        _source.years,
        await dataSources.messyFinanceDataAPI.yearlyFinancials(_source)
      ),

    logo: async (_source, params, { dataSources }) => {
      const res = await dataSources.messyFinanceDataAPI.logo(_source);
      return res ? res.url : null;
    },

    // yearlyPrices: async (_source, params, { dataSources,  }) =>
    //     dataSources.messyFinanceDataAPI.yearlyPrices(_source, ),
  },

  //   ShareClasses: {
  //     yearlyPrices: async (_source, params, { dataSources,  }) =>
  //         priceTableMap(_source.years, _source.shareClassName, await dataSources.messyFinanceDataAPI.pricesForShareClasses(_source, ))
  //   }
};