import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Paper, Grid, Box } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import { priceTableMap, financialTableMap } from './dataMaps';

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

    const [visibleFinancials, setVisibleFinancials] = useState(() => ['pl', 'bs', 'cf']);

    const handleVisibleFinancials = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
        setVisibleFinancials(newFormats);
    };

    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });

    const stock = data && data.getSimfinCompanyByTicker;

    const columns = stock && [
        {
            id: 'expander',
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
                <span {...getToggleAllRowsExpandedProps()}>
                    {isAllRowsExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
                </span>
            ),
            Cell: ({ row, cell }: any) =>
                <span
                    {...row.getToggleRowExpandedProps({
                        style: {
                            // We can even use the row.depth property
                            // and paddingLeft to indicate the depth
                            // of the row
                            paddingLeft: `${row.depth * 1}rem`,
                        },
                    })}
                    // className={row.original.checkPossible ? 'relevant' : ''}
                >
                    {cell.value}
                    {row.canExpand ? (row.isExpanded ? <ArrowDropUp /> : <ArrowDropDown />) : null}
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

    const priceTableData = stock && priceTableMap(stock);

    const financialTableData = stock && financialTableMap(stock);

    console.log({ stock, columns, priceTableData, financialTableData });

    return data ? (
        <div>

            <Paper>
                <Box p={2} mt={2}>
                    <h2>{stock.name} <small>({ticker})</small></h2>
                    <p>Employees: {stock.employees}</p>
                    <p>Sector Name: {stock.sectorName}</p>

                    <p>Share Classes: {
                        stock.shareClasses.map((s: any, i: Number) =>
                            s.shareClassName + (stock.shareClasses.length > i ? ', ' : '.')
                        )}
                    </p>
                </Box>
            </Paper>

            {/* <p>Employees: {stock.employees}</p>
            <p>Employees: {stock.employees}</p> */}

            <ScrollSync><>

                <Paper>
                    <Box p={2} mt={2}>
                        <h2>Price</h2>

                        <Table
                            columns={columns}
                            data={priceTableData}
                        />
                    </Box>
                </Paper>

                <Paper>
                    <Box p={2} mt={2}>

                        <Box
                            display="flex"
                            // width={500} height={80} 
                            // bgcolor="lightgreen"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <ToggleButtonGroup value={visibleFinancials} onChange={handleVisibleFinancials} color="primary">
                                <ToggleButton value="pl">Income Statement</ToggleButton>
                                <ToggleButton value="bs">Balance Sheet</ToggleButton>
                                <ToggleButton value="cf">Cash Flow</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Grid container spacing={3}>
                            {visibleFinancials.includes('pl') && (
                                <Grid item xs={(12/visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Box p={2} mt={2}>
                                            <h2>Income Statement</h2>

                                            <Table
                                                columns={columns}
                                                data={financialTableData.pl}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                            {visibleFinancials.includes('bs') && (
                                <Grid item xs={(12/visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Box p={2} mt={2}>
                                            <h2>Balance Sheet</h2>

                                            <Table
                                                columns={columns}
                                                data={financialTableData.bs}
                                            />

                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                            {visibleFinancials.includes('cf') && (
                                <Grid item xs={(12/visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Box p={2} mt={2}>
                                            <h2>Cash Flow</h2>

                                            <Table
                                                columns={columns}
                                                data={financialTableData.cf}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Paper>
            </></ScrollSync>



            {/* <hr />
            <pre>{JSON.stringify(stock, null, 2)} </pre> */}
        </div>
    ) : <CircularProgress />;
}
