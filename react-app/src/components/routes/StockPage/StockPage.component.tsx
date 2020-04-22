import React from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import numeral from 'numeral';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';

import Table from './Table';

const TICKER_QUERY = gql`
    query($ticker: String!) { 
        getSimfinCompanyByTicker(name: $ticker) {
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
            # industryCompanies {
            #     name
            #     sectorName
            #     # years
            #     # yearlyFinancials {
            #     #   pl
            #     #   bs
            #     #   cf
            #     # }
            #     # shareClasses {
            #     #   shareClassId
            #     #   shareClassName
            #     #   shareClassType
            #     #   yearlyPrices
            #     # }
            # }
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
            id: 'expander',
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
                <span {...getToggleAllRowsExpandedProps()}>
                    {isAllRowsExpanded ? '👇' : '👉'}
                </span>
            ),
            Cell: ({ row, cell }: any) =>
                <span
                    {...row.getToggleRowExpandedProps({
                        style: {
                            // We can even use the row.depth property
                            // and paddingLeft to indicate the depth
                            // of the row
                            paddingLeft: `${row.depth * 2}rem`,
                        },
                    })}
                >
                    {cell.value}
                    {row.canExpand ? (row.isExpanded ? '👇' : '👉') : null}
                </span>,
            accessor: 'title',
            sticky: 'left',
            width: 150
        },
        ...stock.years.map((y: number) => ({
            Header: y,
            accessor: `${y}`,
            width: 90
        }))
    ];

    const priceTableData = stock && [stock.shareClasses[0].yearlyPrices.priceData.reduce((acc: any, curr: any, i: number) => ({
        ...acc,
        [`${stock.years[i]}`]: numeral(curr ? curr.closeAdj : '0').format('(0.00a)')
    }), { title: stock.shareClasses[0].shareClassName })];

    const financialTableData = stock && Object.getOwnPropertyNames(stock.yearlyFinancials)
        .filter((k: string) => k !== '__typename') // graphql spam
        .reduce((acc: any, key: any, i: number) =>
            ({
                ...acc,
                [key]: stock.yearlyFinancials[key]
                    // .filter((y: any) => y.displayLevel === '0') // hack, figure out remaining data or replace please    
                    // .map((y: any) =>
                    .reduce((acc: any, dataPoint: any, i: number) => {
                        // console.log({ dataPoint, acc });
                        if (dataPoint.displayLevel === '0') {
                            return [
                                ...acc,
                                dataPoint.value.reduce((acc: any, value: any, i: number) => ({
                                    ...acc,
                                    [`${stock.years[i]}`]: numeral(value).format('(0.00a)')
                                }), { title: dataPoint.standardisedName, subRows: [] })
                            ];
                        } else if (dataPoint.displayLevel === '1') {
                            return [
                                ...acc.map((tableRow: any, i: number) => {
                                    if (i === acc.length - 1) {
                                        return {
                                            ...tableRow,
                                            subRows: [
                                                ...tableRow.subRows,
                                                dataPoint.value.reduce((acc: any, value: any, i: number) => ({
                                                    ...acc,
                                                    [`${stock.years[i]}`]: numeral(value).format('(0.00a)')
                                                }), { title: dataPoint.standardisedName, subRows: [] })
                                            ]
                                        };
                                    } else {
                                        return tableRow;
                                    }
                                }),
                            ]
                        } else {
                            // console.log(dataPoint.displayLevel)
                            return acc;
                        }
                    }, [])
            })
            , {})

    console.log({ stock, columns, priceTableData, financialTableData });

    return data ? (
        <div className="container">
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

            <ScrollSync><>

                <div className="row no-gutters">
                    <div className="col-12">
                        <h2>Price</h2>

                        <Table
                            columns={columns}
                            data={priceTableData}
                        />
                    </div>
                </div>


                <div className="row no-gutters">

                    <div className="col-4">
                        <h2>Income Statement</h2>

                        <Table
                            columns={columns}
                            data={financialTableData.pl}
                        />
                    </div>


                    <div className="col-4">

                        <h2>Balance Sheet</h2>

                        <Table
                            columns={columns}
                            data={financialTableData.bs}
                        />

                    </div>

                    <div className="col-4">

                        <h2>Cash Flow</h2>

                        <Table
                            columns={columns}
                            data={financialTableData.cf}
                        />

                    </div>

                </div>
            </></ScrollSync>



            {/* <hr />
            <pre>{JSON.stringify(stock, null, 2)} </pre> */}
        </div>
    ) : null;
}