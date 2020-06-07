const { gql } = require("apollo-server");
const GraphQLJSON = require("graphql-type-json");

const {
    financialTableMap,
    outstandingSharesTableMap,
    priceTableMap,
    isolateShares,
  } = require("./dataMaps");

module.exports =  {
    JSON: GraphQLJSON,
    Query: {
      findSimfinStockByName: async (
        _source,
        params,
        { dataSources, redisClient }
      ) => [
        ...(await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(
          params,
          redisClient
        )),
        ...(await dataSources.messyFinanceDataAPI.findSimfinStockByName(
          params,
          redisClient
        )),
      ],
  
      getSimfinCompanyById: async (
        _source,
        params,
        { dataSources, redisClient }
      ) =>
        dataSources.messyFinanceDataAPI.getSimfinCompanyById(params, redisClient),
  
      getSimfinCompanyByTicker: async (
        _source,
        params,
        { dataSources, redisClient }
      ) => {
        const stocks = [
          ...(await dataSources.messyFinanceDataAPI.findSimfinStockByTicker(
            params,
            redisClient
          )),
          ...(await dataSources.messyFinanceDataAPI.findSimfinStockByName(
            params,
            redisClient
          )),
        ];
  
        return dataSources.messyFinanceDataAPI.getSimfinCompanyById(
          { id: stocks[0].simId },
          redisClient
        );
      },
    },
    SimfinStock: {
      aggregatedShares: async (_source, params, { dataSources, redisClient }) =>
        outstandingSharesTableMap(
          _source.years,
          await dataSources.messyFinanceDataAPI.aggregatedShares(
            _source,
            redisClient
          )
        ),
  
      aggregatedSharesIsolated: async (
        _source,
        params,
        { dataSources, redisClient }
      ) =>
        isolateShares(
          _source.years,
          await dataSources.messyFinanceDataAPI.aggregatedShares(
            _source,
            redisClient
          )
        ),
  
      price: async (_source, params, { dataSources, redisClient }) => {
        const shareClasses = await dataSources.messyFinanceDataAPI.shareClasses(
          _source,
          redisClient
        );
  
        return await [priceTableMap(
          _source.years,
          "price",
          await dataSources.messyFinanceDataAPI.pricesForShareClasses(
            {
              simId: _source.simId,
              shareClassId: shareClasses[0].shareClassId,
              years: _source.years,
            },
            redisClient
          )
        )];
      },
  
      shareClasses: async (_source, params, { dataSources, redisClient }) => {
        const shareClasses = await dataSources.messyFinanceDataAPI.shareClasses(
          _source,
          redisClient
        );
  
        // return shareClasses;
        return await Promise.all(
          shareClasses.map(
            async (s) =>
              await priceTableMap(
                _source.years,
                `price ${s.shareClassName}`,
                await dataSources.messyFinanceDataAPI.pricesForShareClasses(
                  {
                    simId: _source.simId,
                    shareClassId: s.shareClassId,
                    years: _source.years,
                  },
                  redisClient
                )
              )
          )
        );
  
        // .map(s =>
        //     await priceTableMap(
        //         _source.years,
        //         s.shareClassName,
        //         await dataSources.messyFinanceDataAPI.pricesForShareClasses(
        //             { simId: _source.simId, shareClassId: s.shareClassId, years: _source.years },
        //             redisClient
        //         )
        //     )
        // ),
      },
  
      industryCompanies: async (_source, params, { dataSources, redisClient }) =>
        (
          await dataSources.messyFinanceDataAPI.getSimfinIndustryCompanies(
            _source.sectorCode,
            redisClient
          )
        ).map(async (company) => ({
          years: _source.years,
          ...(await dataSources.messyFinanceDataAPI.getSimfinCompanyById(
            { id: company.simId },
            redisClient
          )),
        })),
  
      yearlyFinancials: async (_source, params, { dataSources, redisClient }) =>
        financialTableMap(
          _source.years,
          await dataSources.messyFinanceDataAPI.yearlyFinancials(
            _source,
            redisClient
          )
        ),
  
      logo: async (_source, params, { dataSources, redisClient }) => {
        const res = await dataSources.messyFinanceDataAPI.logo(
          _source,
          redisClient
        );
        return res ? res.url : null;
      },
  
      // yearlyPrices: async (_source, params, { dataSources, redisClient }) =>
      //     dataSources.messyFinanceDataAPI.yearlyPrices(_source, redisClient),
    },
  
    //   ShareClasses: {
    //     yearlyPrices: async (_source, params, { dataSources, redisClient }) =>
    //         priceTableMap(_source.years, _source.shareClassName, await dataSources.messyFinanceDataAPI.pricesForShareClasses(_source, redisClient))
    //   }
  };