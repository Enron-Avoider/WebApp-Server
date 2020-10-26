const { RESTDataSource } = require("apollo-datasource-rest");

const { EODDataMaps } = require("../data-maps");

module.exports = {
  EODDataAPI: class extends RESTDataSource {
    constructor() {
      super();

      this.keys = {
        eodhistoricaldata: "5f80d8849f6b13.09550863",
      };
    }

    findStockByName = async ({ name }) => {
        const res = await this.get(
          `
          https://eodhistoricaldata.com/api/screener?
              api_token=${this.keys.eodhistoricaldata}&
              sort=market_capitalization.desc&
              filters=[
                  ["name","match","*${name}*"]
              ]
          `.replace(/\s/g, "")
        );
        return res.data;
    }

    findStockByTicker = async ({ name }) => {
        const res = await this.get(
          `
          https://eodhistoricaldata.com/api/screener?
              api_token=${this.keys.eodhistoricaldata}&
              sort=market_capitalization.desc&
              filters=[
                  ["code","match","*${name}*"]
              ]
          `.replace(/\s/g, "")
        );
        return res.data;
    }

    getStockByCode = async ({ code }) => {
        const fundamentalData = await this.get(
          `
          https://eodhistoricaldata.com/api/fundamentals/${code}?
            api_token=${this.keys.eodhistoricaldata}
          `.replace(/\s/g, "")
        );

        const priceData = await this.get(
            `
                https://eodhistoricaldata.com/api/eod/${code}?
                    period=m&
                    fmt=json&
                    api_token=${this.keys.eodhistoricaldata}
            `
        )

        const yearlyFinancials = EODDataMaps
            .convertEODFundamentalsToEarlyFinancials(
                fundamentalData.Financials,
                priceData
            );

        return {
            code: fundamentalData.General.Code,
            name: fundamentalData.General.Name,
            exchange: fundamentalData.General.Exchange,
            currency_symbol: fundamentalData.General.CurrencySymbol,
            currency_code: fundamentalData.General.CurrencyCode,
            market_capitalization: fundamentalData.Highlights.MarketCapitalization,
            sector: fundamentalData.General.Sector,
            industry: fundamentalData.General.Industry,
            description: fundamentalData.General.Description,
            yearlyFinancials
        };
    }

  },
};
