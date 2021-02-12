import React, { useState, FunctionComponent } from 'react';
import { useQuery } from "@apollo/react-hooks";
import numeral from 'numeral';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import PercentagePath from "@assets/icon-paths/percentage";
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
    SvgIcon,
} from '@material-ui/core';
import { FilterList, Equalizer } from '@material-ui/icons';

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_CALCULATIONS } from '@state/byModel/Calculations/calculations.queries';
import { GET_AGGREGATE_FOR_STOCK } from '@state/byModel/Aggregate/aggregate.queries';
// import getStock from '@state/effects/getStock.effect';

import { doCalculations } from '../calculations'
import Table from '../Table';
import Charts from '../Charts';
import './style.sass';
import Comparer from '../Comparer';

export const Stock: FunctionComponent<{
    ticker: string,
    visibleFinancials: any,
    handleVisibleFinancials: any,
    showPercentage?: any,
    toggleShowPercentage?: any,
    showGraph?: any,
    toggleShowGraph?: any
}> = ({
    ticker,
    visibleFinancials,
    handleVisibleFinancials,
    showPercentage,
    toggleShowPercentage,
    showGraph,
    toggleShowGraph,
}) => {

        const { loading, error, data } = useQuery(GET_STOCK, {
            variables: { ticker },
        });
        const { loading: loading_, error: error_, data: calculations } = useQuery(GET_CALCULATIONS, {
            variables: { ticker },
        });

        // console.log({ calculations });

        // const { stock } = getStock({ ticker });
        // console.log({ stock });

        const stock = data && data.getStockByCode;

        const { loading: loading__, error: error__, data: aggregate_for_todo } = useQuery(GET_AGGREGATE_FOR_STOCK, {
            variables: {
                // sector: stock.sector,
                industry: stock && stock.industry,
                // country: stock.country,
                // exchange: stock.exchange,
                // calcs: stock.sector,
            },
            skip: !stock
        });

        const calculationResults = stock && doCalculations(calculations?.calculations, stock.yearlyFinancials.years, stock);

        const convertAggregateArrayToObjectWithYearlyKeys = (arr: any) =>
            arr?.reduce((p: any, c: any) => ({ ...p, [c._id.year]: c }), {});

        const mergedStockAndAggregateYearlyFinancials = stock && aggregate_for_todo &&
            (Object.entries(stock.yearlyFinancials) as any)
                .filter(([key, value]: any) => !!value && key !== '__typename')
                .reduce(
                    (p: any, [k, v]: any) => ({
                        ...p,
                        [k]: (k === "years") ? v : v.map((v_: any) => ({
                            ...v_,
                            aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                                aggregate_for_todo.getAggregateForStock.defaultRows[`${k}_${v_.title}`]
                            ),
                            ...v_.subRows && {
                                subRows: v_.subRows.map((v__: any) => ({
                                    ...v__,
                                    aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                                        aggregate_for_todo.getAggregateForStock.defaultRows[`${k}_${v_.title}_${v__.title}`]
                                    ),
                                }))
                            }
                        }))
                    }),
                    {}
                );

        console.log({ stock, aggregate_for_todo, mergedStockAndAggregateYearlyFinancials });

        return <>{
            stock ? (
                <>

                    <Box mt={2}>

                        <Grid container spacing={2}>
                            {/* <Grid item xs={2} container>
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
                            </Grid> */}
                            <Grid item xs={5}>
                                <Paper style={{ height: '100%' }}>
                                    <Box display="flex" flexDirection="row" p={2}>
                                        <Box flex="1" maxWidth="100%">
                                            <Box display="flex" flexDirection="column" justifyContent="space-between">
                                                <Box display="flex" flexDirection="row">
                                                    <Box display="flex" alignItems="center" flex="auto">
                                                        <Typography variant="h5">
                                                            {stock.name}
                                                        </Typography>
                                                        <Box ml={1}>
                                                            <Typography variant="h5">
                                                                <b>({ticker})</b>
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    // height="100%"
                                                    >
                                                        <Avatar variant="rounded" src={`//${stock.logo}`} />
                                                    </Box>
                                                </Box>
                                                <Box my={2}>
                                                    <Typography
                                                        display="block"
                                                        noWrap={true}
                                                        variant="body1"
                                                    >
                                                        <span title="sector">{stock.sector}</span>
                                                        {" "}・{" "}
                                                        <span title="industry">{stock.industry}</span>
                                                    </Typography>
                                                    <Typography
                                                        display="block"
                                                        noWrap={true}
                                                        variant="body1"
                                                    >
                                                        {stock.exchange}
                                                        {" "}・{" "}
                                                        {stock.country}
                                                    </Typography>
                                                </Box>
                                                <Box mt={2}>
                                                    <Typography
                                                        display="block"
                                                        noWrap={true}
                                                    >{(stock.currency_symbol === 'p' ? '£' : stock.currency_symbol) + ' ' + numeral(stock.market_capitalization).format('(0.00a)')}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={7}>
                                <Paper style={{ height: '100%' }}>
                                    <Comparer stock={stock} />
                                </Paper>
                            </Grid>
                        </Grid>

                    </Box>

                    <Paper>
                        <Table
                            ticker={ticker}
                            title={'Ratios'}
                            years={stock.yearlyFinancials.years}
                            data={calculationResults}
                            allowNewCalc={true}
                            showPercentage={showPercentage}
                            toggleShowPercentage={toggleShowPercentage}
                            showGraph={showGraph}
                            toggleShowGraph={toggleShowGraph}
                        />
                    </Paper>

                    <Paper>
                        <Table
                            title={'Shares'}
                            years={stock.yearlyFinancials.years}
                            data={
                                [
                                    ...stock.yearlyFinancials.price,
                                    ...stock.yearlyFinancials.aggregatedShares
                                ]
                            }
                            showPercentage={showPercentage}
                            toggleShowPercentage={toggleShowPercentage}
                            showGraph={showGraph}
                            toggleShowGraph={toggleShowGraph}
                        />
                    </Paper>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography variant="h5">
                                    Fin. Statements
                                </Typography>

                                <ToggleButtonGroup size="small" exclusive value={visibleFinancials} onChange={handleVisibleFinancials} color="primary">
                                    <ToggleButton value="pl">Income Statement</ToggleButton>
                                    <ToggleButton value="bs">Balance Sheet</ToggleButton>
                                    <ToggleButton value="cf">Cash Flow</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <Grid container spacing={3}>
                                {visibleFinancials.includes('pl') && (
                                    <Grid item xs={(12) as any}>
                                        <Paper elevation={5}>
                                            <Table
                                                title={'Income Statement'}
                                                showPercentage={showPercentage}
                                                toggleShowPercentage={toggleShowPercentage}
                                                showGraph={showGraph}
                                                toggleShowGraph={toggleShowGraph}
                                                years={stock.yearlyFinancials.years}
                                                data={mergedStockAndAggregateYearlyFinancials?.pl || stock.yearlyFinancials.pl}
                                                isBiggerHACK={true}
                                            />
                                        </Paper>
                                    </Grid>
                                )}
                                {visibleFinancials.includes('bs') && (
                                    <Grid item xs={(12) as any}>
                                        <Paper elevation={5}>
                                            <Table
                                                title={'Balance Sheet'}
                                                showPercentage={showPercentage}
                                                toggleShowPercentage={toggleShowPercentage}
                                                showGraph={showGraph}
                                                toggleShowGraph={toggleShowGraph}
                                                years={stock.yearlyFinancials.years}
                                                data={stock.yearlyFinancials.bs}
                                                isBiggerHACK={true}
                                            />
                                        </Paper>
                                    </Grid>
                                )}
                                {visibleFinancials.includes('cf') && (
                                    <Grid item xs={(12) as any}>
                                        <Paper elevation={5}>
                                            <Table
                                                title={'Cash Flow'}
                                                showPercentage={showPercentage}
                                                toggleShowPercentage={toggleShowPercentage}
                                                showGraph={showGraph}
                                                toggleShowGraph={toggleShowGraph}
                                                years={stock.yearlyFinancials.years}
                                                data={stock.yearlyFinancials.cf}
                                                isBiggerHACK={true}
                                            />
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Paper>

                    <Paper>
                        <Box display="flex" flexDirection="row" p={2} mt={2}>
                            <div>
                                <Typography variant="h5">
                                    About
                                </Typography>
                                <Typography
                                    display="block"
                                    variant="body1"
                                >{stock.description}</Typography>
                            </div>
                        </Box>
                    </Paper>
                </>
            ) : (
                    <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
                        <CircularProgress size={100} />
                    </Box>
                )}</>;
    }
