import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { useLocation, useHistory, Link as Link_ } from "react-router-dom";
// import { DiscussionEmbed } from 'disqus-react';
import {
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import {
    Paper,
    Grid,
    Box,
    Container,
    Typography,
    Avatar,
    Link,
} from '@mui/material';

import env from '@env';
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
                                                <Box flex="1">
                                                    <Box display="flex" flexDirection="row" justifyContent="space-between" flexWrap="wrap" mb="-15px">
                                                        <Box display="flex" flexDirection="row" pb="15px">
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                mr={2}
                                                            >
                                                                <Avatar className="avatar" variant="rounded" src={`//${stock.logo}`} />
                                                            </Box>
                                                            <Box display="flex" flexDirection="column" mt={1}>
                                                                <Box display="flex" alignItems="center" mr={2} mb={-1}>
                                                                    <Typography variant="h6">
                                                                        {stock.name}
                                                                    </Typography>
                                                                    <Box ml={1}>
                                                                        <Typography variant="body2">
                                                                            ({stock.code})
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </Box>

                                                        <Box display="flex" flexDirection="row-reverse" pb="15px">
                                                            <Box>
                                                                <ComparisonsPicker />
                                                            </Box>
                                                            {/* <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                mr={loading_aggregatesForFinancialRows ? 3 : 0}
                                                            >
                                                                {loading_aggregatesForFinancialRows && <CircularProgress />}
                                                            </Box> */}
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
                                                        loading={loading_aggregatesForFinancialRows}
                                                    />
                                                </Box>
                                            ) : null}
                                        </Container>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box height={160} width="100%"></Box>

                        <Paper>
                            <Box display="flex" flexDirection="row" p={2}>
                                <div>
                                    <Typography
                                        variant="h5"
                                    >About</Typography>

                                    <Box display="flex" flexDirection="row" justifyContent="space-between" flexWrap="wrap">
                                        <Box display="flex" flexDirection="column" my={1}>
                                            <Box display="flex" alignItems="flex-start">
                                                <Typography
                                                    display="block"
                                                    noWrap={true}
                                                    variant="body1"
                                                    lineHeight="20px"
                                                >
                                                    <Link
                                                        component={Link_}
                                                        color="primary"
                                                        target="_blank"
                                                        to={{
                                                            pathname: `/ranking/pl.Total Revenue`,
                                                            search: getNewSearchParamsString({
                                                                paramsToAdd: {
                                                                    comparisons: `sector__${stock.sector}`,
                                                                    ticker
                                                                }
                                                            })
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
                                                            search: getNewSearchParamsString({
                                                                paramsToAdd: {
                                                                    comparisons: `industry__${stock.industry}`,
                                                                    ticker
                                                                }
                                                            })
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
                                                            search: getNewSearchParamsString({
                                                                paramsToAdd: {
                                                                    comparisons: `exchange__${stock.exchange}`,
                                                                    ticker
                                                                }
                                                            })
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
                                                            search: getNewSearchParamsString({
                                                                paramsToAdd: {
                                                                    comparisons: `country__${stock.country}`,
                                                                    ticker
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        <span title="country">{stock.country}</span>
                                                    </Link>
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography
                                                display="block"
                                                variant="body1"
                                            >{stock.description}</Typography>
                                        </Box>
                                    </Box>

                                </div>
                            </Box>
                        </Paper>

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
                                        loading={loading_aggregatesForFinancialRows}
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
                                                                loading={loading_aggregatesForFinancialRows}
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
                                                                loading={loading_aggregatesForFinancialRows}
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
                                                                loading={loading_aggregatesForFinancialRows}
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

                        {/* <Paper>
                            <Box display="flex" flexDirection="column" p={2} mt={2}>
                                <Typography
                                    variant="h5"
                                >Comments</Typography>

                                <br />

                                <DiscussionEmbed
                                    shortname='enronavoider'
                                    config={
                                        {
                                            url: `${env.website}/stock/${stock.code}`,
                                            identifier: `enronavoiderstock${stock.code}`,
                                            title: stock.name,
                                        }
                                    }
                                />
                            </Box>
                        </Paper> */}
                    </>
                ) : (
                    <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
                        <CircularProgress size={100} />
                    </Box>
                )}</>;
    }
