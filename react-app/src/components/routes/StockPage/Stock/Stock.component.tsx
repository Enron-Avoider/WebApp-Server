import React, { FunctionComponent } from 'react';
import { useQuery } from "react-apollo";
import { useLocation, useHistory, Link as Link_ } from "react-router-dom";

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
import { GET_AGGREGATES_FOR_FINANCIAL_ROWS } from '@state/byModel/Aggregate/aggregate.queries';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import './style.sass';
import Table from '../Table';
import { mergeStockAndAggregatesForYearlyFinancials } from '@state/byModel/Stocks/stock.map';
import RatioCollections from '../RatioCollections';
import ComparisonsPicker from '@components/shared/ComparisonsPicker';
import getComparisonOptions from '@state/byModel/ComparisonOptions/ComparisonOptions.effect';

export const Stock: FunctionComponent<{
    ticker: string,
}> = ({
    ticker,
}) => {

        const location = useLocation();
        const history = useHistory();
        const { allSearchParams, getNewSearchParamsString } = useSearchParams();
        const { visibleFinancials } = allSearchParams;
        const { pickedComparisons } = getComparisonOptions();

        const handleVisibleFinancials = (_: any, newFin: string) => history.push({
            pathname: location.pathname,
            search: getNewSearchParamsString({
                paramsToAdd: { visibleFinancials: newFin }
            }),
        });

        const { loading: stock_loading, error: stock_error, data: stock_data } = useQuery(GET_STOCK, {
            variables: { ticker },
            skip: !ticker
        });

        const stock = stock_data && stock_data.getStockByCode;

        const {
            loading: loading_aggregatesForFinancialRows,
            error: error_aggregatesForFinancialRows,
            data: aggregatesForFinancialRows
        } = useQuery(GET_AGGREGATES_FOR_FINANCIAL_ROWS(stock && pickedComparisons || [], stock), {
            skip: !stock || !pickedComparisons
        });

        const mergedStockAndAggregatesYearlyFinancials = mergeStockAndAggregatesForYearlyFinancials({
            stock, aggregates: aggregatesForFinancialRows
        });

        const paramsToAddForStockRelatedStuffLink = {
            paramsToAdd: {
                comparisons: 'Stock_Related__industry-Stock_Related__sector-Stock_Related__country-Stock_Related__exchange&ratioCollections-Stock_Related__exchange',
                ticker
            }
        };

        return <>
            {
                !stock_loading && stock ? (
                    <>

                        <Box position="fixed" top={63} width="100%" left={0} zIndex={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper style={{ height: '100%' }}>
                                        <Container>
                                            <Box display="flex" flexDirection="row" p={2}>
                                                <Box flex="1" maxWidth="100%">
                                                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                                                        <Box display="flex" flexDirection="row">
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                mr={2}
                                                            >
                                                                <Avatar className="avatar" variant="rounded" src={`//${stock.logo}`} />
                                                            </Box>
                                                            <Box display="flex" flexDirection="column" >
                                                                <Box display="flex" alignItems="center" mr={2}>
                                                                    <Typography variant="h6">
                                                                        {stock.name}
                                                                    </Typography>
                                                                    <Box ml={1}>
                                                                        <Typography variant="body2">
                                                                            ({ticker})
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                                <Box display="flex" flex="auto" alignItems="flex-start" flexDirection="column">
                                                                    <Typography
                                                                        display="block"
                                                                        noWrap={true}
                                                                        variant="body1"
                                                                    >
                                                                        <Link
                                                                            component={Link_}
                                                                            color="primary"
                                                                            target="_blank"
                                                                            to={{
                                                                                pathname: `/ranking/pl.Total Revenue`,
                                                                                search: getNewSearchParamsString(paramsToAddForStockRelatedStuffLink)
                                                                            }}
                                                                        >
                                                                            <span title="sector">{stock.sector}</span>
                                                                        </Link>
                                                                        {" "}・{" "}
                                                                        <Link
                                                                            component={Link_}
                                                                            color="primary"
                                                                            target="_blank"
                                                                            to={{
                                                                                pathname: `/ranking/pl.Total Revenue`,
                                                                                search: getNewSearchParamsString(paramsToAddForStockRelatedStuffLink)
                                                                            }}
                                                                        >
                                                                            <span title="industry">{stock.industry}</span>
                                                                        </Link>
                                                                        {" "}・{" "}
                                                                        <Link
                                                                            component={Link_}
                                                                            color="primary"
                                                                            target="_blank"
                                                                            to={{
                                                                                pathname: `/ranking/pl.Total Revenue`,
                                                                                search: getNewSearchParamsString(paramsToAddForStockRelatedStuffLink)
                                                                            }}
                                                                        >
                                                                            <span title="exchange">{stock.exchange}</span>
                                                                        </Link>
                                                                        {" "}・{" "}
                                                                        <Link
                                                                            component={Link_}
                                                                            color="primary"
                                                                            target="_blank"
                                                                            to={{
                                                                                pathname: `/ranking/pl.Total Revenue`,
                                                                                search: getNewSearchParamsString(paramsToAddForStockRelatedStuffLink)
                                                                            }}
                                                                        >
                                                                            <span title="country">{stock.country}</span>
                                                                        </Link>
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Box display="flex" flexDirection="row">
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                mr={3}
                                                            >
                                                                {loading_aggregatesForFinancialRows && <CircularProgress />}
                                                            </Box>
                                                            <ComparisonsPicker />
                                                        </Box>

                                                    </Box>
                                                </Box>
                                            </Box>

                                            {stock.yearlyFinancials ? (
                                                <Box mt={-4}>
                                                    <Table
                                                        years={stock.yearlyFinancials?.years}
                                                        data={[]}
                                                        ticker={ticker}
                                                    />
                                                </Box>
                                            ) : null}
                                        </Container>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box height={140} width="100%"></Box>

                        {stock.yearlyFinancials ? (
                            <>
                                <RatioCollections
                                    stock={stock}
                                    ticker={ticker}
                                />
                                {/* <Paper>
                                    <Box display="flex" flexDirection="row" p={2} mt={2}>
                                        <div>
                                            <Typography variant="h5">
                                                Analysis Ratings & Checks
                                    </Typography>
                                            <Typography
                                                display="block"
                                                variant="body1"
                                            >[ In Development ]</Typography>
                                        </div>
                                    </Box>
                                </Paper> */}

                                <Paper>
                                    <Table
                                        title={'Shares'}
                                        years={stock.yearlyFinancials?.years}
                                        data={
                                            [
                                                ...(mergedStockAndAggregatesYearlyFinancials?.marketCap || stock.yearlyFinancials?.marketCap) || [],
                                                ...(mergedStockAndAggregatesYearlyFinancials?.aggregatedShares || stock.yearlyFinancials?.aggregatedShares) || [],
                                                ...(mergedStockAndAggregatesYearlyFinancials?.price || stock.yearlyFinancials?.price) || [],
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
                                                Financial Statements
                                    </Typography>

                                            <ToggleButtonGroup size="small" exclusive value={visibleFinancials || 'pl'} onChange={handleVisibleFinancials} color="primary">
                                                <ToggleButton value="pl" defaultChecked>Income Statement</ToggleButton>
                                                <ToggleButton value="bs">Balance Sheet</ToggleButton>
                                                <ToggleButton value="cf">Cash Flow</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>

                                        <Box mx={-1} mb={-2}>
                                            <Grid container spacing={3}>
                                                {(!visibleFinancials || visibleFinancials === 'pl') && (
                                                    <Grid item xs={(12) as any}>
                                                        <Paper elevation={5}>
                                                            <Table
                                                                title={'Income Statement'}
                                                                years={stock.yearlyFinancials?.years}
                                                                data={mergedStockAndAggregatesYearlyFinancials?.pl || stock.yearlyFinancials?.pl}
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
                                                                years={stock.yearlyFinancials?.years}
                                                                data={mergedStockAndAggregatesYearlyFinancials?.bs || stock.yearlyFinancials?.bs}
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
                                                                years={stock.yearlyFinancials?.years}
                                                                data={mergedStockAndAggregatesYearlyFinancials?.cf || stock.yearlyFinancials?.cf}
                                                                ticker={ticker}
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Paper>
                            </>
                        ) : null}

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
