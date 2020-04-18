import React from 'react';
import { useParams } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const TICKER_QUERY = gql`
    query($ticker: String!) { 
        getSimfinCompanyByTicker(name:  $ticker) {
            name
            ticker
            simId
            fyearEnd
            employees
            sectorName
            sectorCode
            # aggregatedShares
            shareClasses {
                shareClassId
                shareClassName
                shareClassType
                yearlyPrices
            }
            years
            yearlyFinancials {
                pl
                bs
                cf
            }
            # yearlyPrices
            industryCompanies {
                name
                sectorName
                # years
                # yearlyFinancials {
                #   pl
                #   bs
                #   cf
                # }
                # shareClasses {
                #   shareClassId
                #   shareClassName
                #   shareClassType
                #   yearlyPrices
                # }
            }
        }
    }
`;

export default function Page1() {

    const { ticker } = useParams();

    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });

    return <>
        <p>Page1: {ticker}</p>

        <pre>{JSON.stringify(data, null, 2)} </pre>

    </>;
}
