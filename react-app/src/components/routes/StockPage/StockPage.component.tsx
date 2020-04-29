import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Paper, Grid, Box, Typography } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import { priceTableMap, outstandingSharesTableMap, mergeCalculationsWithTable } from './dataMaps';
import { doCalculations, calculations } from './calculations'

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
            aggregatedShares
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

    const calc = stock && doCalculations(calculations, stock.years, stock);

    // const priceTableData = stock && priceTableMap(stock.years, stock.shareClasses);

    // const outstandingSharesTableData = stock && outstandingSharesTableMap(stock.years, stock.aggregatedShares);

    const columns = stock && [
        {
            id: 'expander',
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
                <span {...getToggleAllRowsExpandedProps()}>
                    {isAllRowsExpanded ? 'expand none' : 'expand all'}
                </span>
            ),
            Cell: ({ row, cell }: any) =>
                <span
                    {...row.getToggleRowExpandedProps({
                        style: {
                            paddingLeft: `${row.depth * 1}rem`,
                        },
                    })}
                // className={row.original.checkPossible ? 'relevant' : ''}
                >
                    {cell.value}
                    {/* {row.canExpand ? (row.isExpanded ? <ArrowDropUp /> : <ArrowDropDown />) : null} */}
                </span>,
            accessor: 'title',
            sticky: 'left',
            width: 170
        },
        ...stock.years.map((y: number) => ({
            Header: y,
            accessor: `${y}`,
            width: 90
        }))
    ];

    console.log({ stock, columns, calc });

    return data ? (
        <Box pb={2}>
            <Paper>
                <Box p={2} mt={2}>
                    <Box display="flex" alignItems="center">
                        <Typography variant="h5">
                            {stock.name}
                        </Typography>
                        <Box ml={1}>
                            <Typography variant="h5">
                                <b>({ticker})</b>
                            </Typography>
                        </Box>
                    </Box>
                    <div>
                        {/* <p>Employees: {stock.employees}</p> */}
                        <Typography variant="body1">Sector Name: {stock.sectorName}</Typography>

                        <Typography variant="body1">Share Classes: {
                            stock.shareClasses.map((s: any, i: Number) =>
                                s.shareClassName + (stock.shareClasses.length - 1 > i ? ', ' : '.')
                            )}
                        </Typography>
                    </div>
                </Box>
            </Paper>

            <ScrollSync><>

                <Paper>
                    <Table
                        title={'Shares'}
                        columns={columns}
                        data={
                            [
                                stock.shareClasses[0].yearlyPrices,
                                ...stock.aggregatedShares
                            ]
                        }
                    />
                </Paper>

                <Paper>
                    <Box p={2} mt={2}>

                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Typography variant="h5" gutterBottom>
                                Financial Statements
                            </Typography>

                            <ToggleButtonGroup value={visibleFinancials} onChange={handleVisibleFinancials} color="primary">
                                <ToggleButton value="pl">Income Statement</ToggleButton>
                                <ToggleButton value="bs">Balance Sheet</ToggleButton>
                                <ToggleButton value="cf">Cash Flow</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Grid container spacing={3}>
                            {visibleFinancials.includes('pl') && (
                                <Grid item xs={(12 / visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Table
                                            title={'Income Statement'}
                                            columns={columns}
                                            data={[
                                                ...stock.yearlyFinancials.pl,
                                                ...calc.filter((c: any) => c.onTable === 'Income Statement')
                                            ]}
                                            calculations={calc.filter((c: any) => c.onTable === 'Income Statement')}
                                        />
                                    </Paper>
                                </Grid>
                            )}
                            {visibleFinancials.includes('bs') && (
                                <Grid item xs={(12 / visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Table
                                            title={'Balance Sheet'}
                                            columns={columns}
                                            data={stock.yearlyFinancials.bs}
                                        />
                                    </Paper>
                                </Grid>
                            )}
                            {visibleFinancials.includes('cf') && (
                                <Grid item xs={(12 / visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Table
                                            title={'Cash Flow'}
                                            columns={columns}
                                            data={stock.yearlyFinancials.cf}
                                        />
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Paper>
            </></ScrollSync>
        </Box>
    ) : (
        <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={100} />
        </Box>
    );
}
