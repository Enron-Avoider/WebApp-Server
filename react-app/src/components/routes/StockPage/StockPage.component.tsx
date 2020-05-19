import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Paper, Grid, Box, Typography, Avatar } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';

import TICKER_QUERY from '@queries/ticker';

import { priceTableMap, outstandingSharesTableMap, mergeCalculationsWithTable } from './dataMaps';
import { doCalculations, calculations } from './calculations'
import Table from './Table';

export default function StockPage() {

    const { ticker } = useParams();
    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });

    const [visibleFinancials, setVisibleFinancials] = useState(() => ['pl', 'bs']);

    const handleVisibleFinancials = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
        setVisibleFinancials(newFormats);
    };

    const stock = data && data.getSimfinCompanyByTicker;

    const calc = stock && doCalculations(calculations, stock.years, stock);

    console.log({ stock, calc });

    return data ? (
        <Box pb={2}>

            <Grid container spacing={3}>
                <Grid item xs={8}>
                    <Paper>
                        <Box display="flex" flexDirection="row" p={2} mt={2}>
                            <div>
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
                            </div>
                            <Box p={2} display="flex" justifyContent="flex-end" flex={1}>
                                <Avatar src={stock.logo} />
                            </Box>
                        </Box>
                    </Paper>


                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Box display="flex" flexDirection="row" p={2} mt={2}>
                            Flower chart will go here
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <ScrollSync><>

                <Paper>
                    <Table
                        title={'Charts'}
                        years={stock.years}
                        data={calc}
                    />
                </Paper>

                <Paper>
                    <Table
                        title={'Calculations'}
                        years={stock.years}
                        data={calc}
                    />
                </Paper>

                <Paper>
                    <Table
                        title={'Shares'}
                        years={stock.years}
                        data={
                            [
                                ...stock.price,
                                ...stock.shareClasses,
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
                                            years={stock.years}
                                            data={[
                                                ...stock.yearlyFinancials.pl,
                                                ...calc.filter((c: any) => c.onTable === 'Income Statement')
                                            ]}
                                        />
                                    </Paper>
                                </Grid>
                            )}
                            {visibleFinancials.includes('bs') && (
                                <Grid item xs={(12 / visibleFinancials.length) as any}>
                                    <Paper elevation={5}>
                                        <Table
                                            title={'Balance Sheet'}
                                            years={stock.years}
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
                                            years={stock.years}
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
