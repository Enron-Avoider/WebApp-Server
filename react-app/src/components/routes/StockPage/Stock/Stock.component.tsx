import React, { FunctionComponent } from 'react';
import { useQuery } from "react-apollo";
import { useLocation, useHistory } from "react-router-dom";

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    Paper,
    Grid,
    Box,
    Container,
    Typography,
    Avatar,
    Link,
} from '@material-ui/core';

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_AGGREGATE_FOR_FINANCIAL_ROWS, GET_AGGREGATES_FOR_FINANCIAL_ROWS } from '@state/byModel/Aggregate/aggregate.queries';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import './style.sass';
import Table from '../Table';
import { mergeStockAndAggregateYearlyFinancials, mergeStockAndAggregatesForYearlyFinancials } from './Stock.map';
import RatioCollections from '../RatioCollections';
import ComparisonsPicker from '@components/shared/ComparisonsPicker';

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

        const { loading, error, data } = useQuery(GET_STOCK, {
            variables: { ticker },
            skip: !ticker
        });

        const stock = data && data.getStockByCode;

        const pickedComparisons = allSearchParams.comparisons?.split('-')
            .filter((c: any) => typeof c !== 'undefined')

        const {
            loading: loading_aggregatesForFinancialRows, error: error_aggregatesForFinancialRows, data: aggregatesForFinancialRows
        } = useQuery(GET_AGGREGATES_FOR_FINANCIAL_ROWS(stock && pickedComparisons || [], stock), {
            skip: !stock || !pickedComparisons
        });

        const mergedStockAndAggregatesYearlyFinancials = mergeStockAndAggregatesForYearlyFinancials({
            stock, aggregates: aggregatesForFinancialRows
        });

        console.log({
            stock,
            pickedComparisons,
            aggregatesForFinancialRows,
            mergedStockAndAggregatesYearlyFinancials
        });

        return <>
            {
                stock ? (
                    <>

                        <Box position="fixed" top={63} width="100%" left={0} zIndex={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper style={{ height: '100%' }}>
                                        <Container>
                                            <Box display="flex" flexDirection="row" p={2}>
                                                <Box flex="1" maxWidth="100%">
                                                    <Box display="flex" flexDirection="column" justifyContent="space-between">
                                                        <Box display="flex" flexDirection="row" >
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
                                                                mr={3}
                                                            >
                                                                <Avatar variant="rounded" src={`//${stock.logo}`} />
                                                            </Box>
                                                            <Box display="flex" flex="auto" alignItems="flex-start" flexDirection="column">
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
                                                            <ComparisonsPicker />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Container>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box height={80} width="100%"></Box>

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
                                        ...(mergedStockAndAggregatesYearlyFinancials?.price || stock.yearlyFinancials.price),
                                        ...(mergedStockAndAggregatesYearlyFinancials?.aggregatedShares || stock.yearlyFinancials.aggregatedShares),
                                    ]
                                }
                                ticker={ticker}
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
                                                    data={mergedStockAndAggregatesYearlyFinancials?.pl || stock.yearlyFinancials.pl}
                                                    ticker={ticker}
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
                                                    data={mergedStockAndAggregatesYearlyFinancials?.bs || stock.yearlyFinancials.bs}
                                                    ticker={ticker}
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
                                                    data={mergedStockAndAggregatesYearlyFinancials?.cf || stock.yearlyFinancials.cf}
                                                    ticker={ticker}
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
