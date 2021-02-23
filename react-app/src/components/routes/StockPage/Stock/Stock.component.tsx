import React, { useState, FunctionComponent, useContext } from 'react';
import { useQuery } from "react-apollo";
import numeral from 'numeral';
import { useParams, useLocation, useHistory } from "react-router-dom";

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@material-ui/core';

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_RATIO_COLLECTIONS, GET_CALCULATIONS } from '@state/byModel/Calculations/calculations.queries';
import { GET_AGGREGATE_FOR_STOCK } from '@state/byModel/Aggregate/aggregate.queries';
import { calculationsStore } from '@state/byModel/Calculations/calculations.contextReducer';

import './style.sass';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { doCalculations } from '../calculations.map'
import Table from '../Table';
import { mergeStockAndAggregateYearlyFinancials, mergeAggregateCalculations } from './Stock.map';
import RatioCollections from '../RatioCollections';

export const Stock: FunctionComponent<{
    ticker: string,
}> = ({
    ticker,
}) => {

        const location = useLocation();
        const history = useHistory();
        const { allSearchParams, getNewSearchParamsString } = useSearchParams();
        const { visibleFinancials } = allSearchParams;

        const handleVisibleFinancials = (_: any, newFin: string) => history.push({
            pathname: location.pathname,
            search: getNewSearchParamsString({
                paramsToAdd: { visibleFinancials: newFin }
            }),
        });

        const { state: calculationsState, dispatch } = useContext(calculationsStore);

        const { loading, error, data } = useQuery(GET_STOCK, {
            variables: { ticker },
            skip: !ticker
        });

        const { loading: loading_, error: error_, data: calculations } = useQuery(GET_CALCULATIONS, {
            variables: { ticker },
            skip: !ticker
        });

        const stock = data && data.getStockByCode;

        const calculationResults = stock && doCalculations(calculations?.calculations, stock.yearlyFinancials.years, stock);

        // TODO: getMergedAggregates.effect

        const { loading: loading__, error: error__, data: aggregate_for_todo } = useQuery(GET_AGGREGATE_FOR_STOCK, {
            variables: {
                // sector: stock.sector,
                industry: stock && stock.industry,
                // country: stock.country,
                // exchange: stock.exchange,
                ...calculations?.calculations.length && { calcs: calculations?.calculations }
            },
            skip: !stock
        });

        const mergedStockAndAggregateYearlyFinancials = mergeStockAndAggregateYearlyFinancials(stock, aggregate_for_todo);

        const mergedAggregateCalculations = mergeAggregateCalculations(calculationResults, aggregate_for_todo, stock);

        console.log({
            stock,
            calculations,
            aggregate_for_todo,
            mergedStockAndAggregateYearlyFinancials,
            calculationResults,
            mergedAggregateCalculations
        });

        return <>
            <button onClick={() => dispatch({ type: 'hii' })}> Hii! {calculationsState.hi} </button>
            {
                stock ? (
                    <>

                        <Box mt={2}>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper style={{ height: '100%' }}>
                                        <Box display="flex" flexDirection="row" p={2}>
                                            <Box flex="1" maxWidth="100%">
                                                <Box display="flex" flexDirection="column" justifyContent="space-between">
                                                    <Box display="flex" flexDirection="row">
                                                        <Box display="flex" alignItems="center" mr={2}>
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
                                                        >
                                                            <Avatar variant="rounded" src={`//${stock.logo}`} />
                                                        </Box>
                                                        <Box display="flex" flex="auto" alignItems="flex-end" flexDirection="column">
                                                            <Typography
                                                                display="block"
                                                                noWrap={true}
                                                                variant="body1"
                                                            >
                                                                <Link href="#" color="primary" target="_blank">
                                                                    <span title="sector">{stock.sector}</span>
                                                                </Link>
                                                                {" "}・{" "}
                                                                <Link href="#" color="primary" target="_blank">
                                                                    <span title="industry">{stock.industry}</span>
                                                                </Link>
                                                            </Typography>
                                                            <Typography
                                                                display="block"
                                                                noWrap={true}
                                                                variant="body1"
                                                            >
                                                                <Link href="#" color="primary" target="_blank">
                                                                    <span title="exchange">{stock.exchange}</span>
                                                                </Link>
                                                                {" "}・{" "}
                                                                <Link href="#" color="primary" target="_blank">
                                                                    <span title="country">{stock.country}</span>
                                                                </Link>
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    {/* <Box mt={2}>
                                                        <Typography
                                                            display="block"
                                                            noWrap={true}
                                                        >{'$ ' + numeral(stock.market_capitalization).format('(0.00a)')}</Typography>
                                                    </Box> */}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                        </Box>

                        <RatioCollections
                            stock={stock}
                            ticker={ticker}
                        />

                        <Paper>
                            <Table
                                title={'Shares'}
                                years={stock.yearlyFinancials.years}
                                data={
                                    [
                                        ...(mergedStockAndAggregateYearlyFinancials?.price || stock.yearlyFinancials.price),
                                        ...(mergedStockAndAggregateYearlyFinancials?.aggregatedShares || stock.yearlyFinancials.aggregatedShares),
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
                                    <Typography variant="h5">
                                        Fin. Statements
                                    </Typography>

                                    <ToggleButtonGroup size="small" exclusive value={visibleFinancials || 'pl'} onChange={handleVisibleFinancials} color="primary">
                                        <ToggleButton value="pl" defaultChecked>Income Statement</ToggleButton>
                                        <ToggleButton value="bs">Balance Sheet</ToggleButton>
                                        <ToggleButton value="cf">Cash Flow</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Grid container spacing={3}>
                                    {(!visibleFinancials || visibleFinancials === 'pl') && (
                                        <Grid item xs={(12) as any}>
                                            <Paper elevation={5}>
                                                <Table
                                                    title={'Income Statement'}
                                                    years={stock.yearlyFinancials.years}
                                                    data={mergedStockAndAggregateYearlyFinancials?.pl || stock.yearlyFinancials.pl}
                                                />
                                            </Paper>
                                        </Grid>
                                    )}
                                    {visibleFinancials === 'bs' && (
                                        <Grid item xs={(12) as any}>
                                            <Paper elevation={5}>
                                                <Table
                                                    title={'Balance Sheet'}
                                                    years={stock.yearlyFinancials.years}
                                                    data={mergedStockAndAggregateYearlyFinancials?.bs || stock.yearlyFinancials.bs}
                                                />
                                            </Paper>
                                        </Grid>
                                    )}
                                    {visibleFinancials === 'cf' && (
                                        <Grid item xs={(12) as any}>
                                            <Paper elevation={5}>
                                                <Table
                                                    title={'Cash Flow'}
                                                    years={stock.yearlyFinancials.years}
                                                    data={mergedStockAndAggregateYearlyFinancials?.cf || stock.yearlyFinancials.cf}
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
