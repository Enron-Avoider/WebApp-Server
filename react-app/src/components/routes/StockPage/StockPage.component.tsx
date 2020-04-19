import React from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

import Table from './Table';

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

export default function StockPage() {

    const { ticker } = useParams();

    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });

    const stock = data && data.getSimfinCompanyByTicker;

    const columns = stock && [
        {
            Header: '',
            accessor: 'title',
            sticky: 'left'
        },
        ...stock.years.map((y: number) => ({
            Header: y,
            accessor: `${y}`
        }))
    ];

    const tableData =  stock && stock.yearlyFinancials.pl.map((y: any) => 
        y.value.reduce((acc: any, curr: any, i: number) => ({
            ...acc,
            [`${stock.years[i]}`]: curr
        }), { title: y.standardisedName})
    );
    
    const tableData_ = stock && [stock.years.reduce((acc: any, curr: any) => ({
        ...acc,
        [`${curr}`]: curr
    }), { title: 'years' })];

    console.log({ stock, columns, tableData, tableData_ });



    return data ? (
        <>
            <h2>{stock.name} <small>({ticker})</small></h2>
            <p>Employees: {stock.employees}</p>
            <p>Sector Name: {stock.sectorName}</p>

            <p>Share Classes: {
                stock.shareClasses.map((s: any, i: Number) =>
                    s.shareClassName + (stock.shareClasses.length > i ? ', ' : '.')
                )}
            </p>

            {/* <p>Employees: {stock.employees}</p>
            <p>Employees: {stock.employees}</p> */}

            <br />
            <br />

            <Table
                columns={columns}
                data={tableData}
            />


            <br />
            <hr />
            <pre>{JSON.stringify(stock, null, 2)} </pre>
        </>
    ) : null;
}
