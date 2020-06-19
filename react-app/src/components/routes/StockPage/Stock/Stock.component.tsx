import React, { useState, FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Link } from 'react-router-dom';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    IconButton,
    ClickAwayListener,
    MenuList,
    Button,
    Card,
    CardContent,
} from '@material-ui/core';
import { Equalizer, FilterList } from '@material-ui/icons';

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_CALCULATIONS } from '@state/byModel/calculations/calculations.queries';

import { doCalculations } from '../calculations'
import Table from '../Table';
import Charts from '../Charts';

export const Stock: FunctionComponent<{
    ticker: string,
    visibleFinancials: any,
    handleVisibleFinancials: any,
    showPercentage?: any,
    toggleShowPercentage?: any,
}> = ({
    ticker,
    visibleFinancials,
    handleVisibleFinancials,
    showPercentage,
    toggleShowPercentage
}) => {

        const { loading, error, data } = useQuery(GET_STOCK, {
            variables: { ticker },
        });
        const { loading: loading_, error: error_, data: calculations } = useQuery(GET_CALCULATIONS, {
            variables: { ticker },
        });

        const stock = data && data.getSimfinCompanyByTicker;
        const calculationResults = stock && doCalculations(calculations?.calculations, stock.yearlyFinancials.years, stock);

        return !loading && !error ? (
            <>

                <Box mt={2}>

                    <Grid container spacing={3}>
                        <Grid item xs={8}>
                            <Paper>
                                <Box display="flex" flexDirection="row" p={2}>
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
                                            <Typography variant="body1">{stock.sectorAndIndustry.sector} ・ {stock.sectorAndIndustry.industry}</Typography>

                                            {/* <Typography variant="body1">Share Classes: {
                                                                stock.shareClasses.map((s: any, i: Number) =>
                                                                    s.shareClassName + (stock.shareClasses.length - 1 > i ? ', ' : '.')
                                                                )}
                                                            </Typography> */}
                                        </div>
                                    </div>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={4} container>
                            <Box flex={1}>
                                <Paper style={{ height: '100%' }}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        height="100%"
                                    >
                                        <Avatar variant="rounded" src={stock.logo} />
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>

                </Box>

                <Paper>
                    <Charts
                        yearlyFinancials={stock.yearlyFinancials}
                        calculations={calculationResults}
                        showPercentage={showPercentage}
                        toggleShowPercentage={toggleShowPercentage}
                    />
                </Paper>

                <Paper>

                    <Table
                        title={'Ratios'}
                        years={stock.yearlyFinancials.years}
                        data={calculationResults}
                    />

                </Paper>

                <Paper>

                    <Table
                        title={'Shares'}
                        years={stock.yearlyFinancials.years}
                        data={
                            [
                                ...stock.yearlyFinancials.price,
                                // ...stock.shareClasses,
                                ...stock.yearlyFinancials.aggregatedShares
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
                                            showPercentage={showPercentage}
                                            toggleShowPercentage={toggleShowPercentage}
                                            years={stock.yearlyFinancials.years}
                                            data={[
                                                ...stock.yearlyFinancials.pl,
                                                ...calculationResults.filter((c: any) => c.onTable === 'Income Statement')
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
                                            showPercentage={showPercentage}
                                            toggleShowPercentage={toggleShowPercentage}
                                            years={stock.yearlyFinancials.years}
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
                                            showPercentage={showPercentage}
                                            toggleShowPercentage={toggleShowPercentage}
                                            years={stock.yearlyFinancials.years}
                                            data={stock.yearlyFinancials.cf}
                                        />
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                </Paper>
            </>
        ) : (
                <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress size={100} />
                </Box>
            );
    }
