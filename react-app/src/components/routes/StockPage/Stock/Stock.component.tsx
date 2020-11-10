import React, { useState, FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Link } from 'react-router-dom';
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
import { GET_CALCULATIONS } from '@state/byModel/calculations/calculations.queries';

import { doCalculations } from '../calculations'
import Table from '../Table';
import Charts from '../Charts';
import './style.sass';

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

        const stock = data && data.getStockByCode;
        const calculationResults = stock && doCalculations(calculations?.calculations, stock.yearlyFinancials.years, stock);

        console.log({ stock });

        return <>{
            !loading && !error ? (
                <>

                    <Box mt={2}>

                        <Grid container spacing={3}>
                            <Grid item xs={3} container>
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
                            <Grid item xs={9}>
                                <Paper>
                                    <Box display="flex" flexDirection="row" p={2}>
                                        <Box flex="1">
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
                                                <Box>
                                                    <Typography
                                                        display="block"
                                                        noWrap={true}
                                                    >{(stock.currency_symbol === 'p' ? '£' : stock.currency_symbol) + ' ' + numeral(stock.market_capitalization).format('(0.00a)')}</Typography>
                                                </Box>
                                            </Box>
                                            <Box mt={1}>
                                                <Typography
                                                    display="block"
                                                    noWrap={true}
                                                    variant="body1"
                                                >
                                                    {stock.sector}
                                                    <IconButton color="primary">
                                                        <FilterList fontSize="small" />
                                                    </IconButton>
                                                    <IconButton color="primary">
                                                        <SvgIcon fontSize="small" viewBox="0 0 344 344">
                                                            <path d={PercentagePath} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                    {"   "}
                                                    {stock.industry}
                                                    <IconButton color="secondary">
                                                        <FilterList fontSize="small" />
                                                    </IconButton>
                                                    <IconButton color="secondary">
                                                        <SvgIcon fontSize="small" viewBox="0 0 344 344">
                                                            <path d={PercentagePath} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                    {/* ・{" "} */}
                                                </Typography>
                                            </Box>
                                            <Box mt={-1} mb={-1}>
                                                <Typography
                                                    display="block"
                                                    noWrap={true}
                                                    variant="body1"
                                                >
                                                    {stock.exchange}
                                                    <IconButton>
                                                        <FilterList fontSize="small" />
                                                    </IconButton>
                                                    <IconButton >
                                                        <SvgIcon fontSize="small" viewBox="0 0 344 344">
                                                            <path d={PercentagePath} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                    {"   "}
                                                    {stock.country}
                                                    <IconButton>
                                                        <FilterList fontSize="small" />
                                                    </IconButton>
                                                    <IconButton >
                                                        <SvgIcon fontSize="small" viewBox="0 0 344 344">
                                                            <path d={PercentagePath} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    display="block"
                                                    noWrap={true}
                                                    variant="body1"
                                                >
                                                    previous year
                                                    <IconButton color={showPercentage ? 'secondary' : 'primary'} onClick={toggleShowPercentage}>
                                                        <SvgIcon fontSize="small" viewBox="0 0 344 344">
                                                            <path d={PercentagePath} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                </Typography>
                                                {/* <IconButton color={showGraph ? 'secondary' : 'primary'} onClick={toggleShowGraph}>
                                                    <Equalizer />
                                                </IconButton> */}
                                            </Box>
                                        </Box>
                                    </Box>
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
                                    // ...stock.shareClasses,
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
                                                data={[
                                                    ...stock.yearlyFinancials.pl,
                                                    // ...calculationResults.filter((c: any) => c.onTable === 'Income Statement')
                                                ]}
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
