import React, { useState, FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Link } from 'react-router-dom';
import ReactResizeDetector from 'react-resize-detector';

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
    CardContent
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_INDUSTRY, GET_SECTOR } from '@state/byModel/IndustriesAndSectors/industriesAndSectors.queries';
import { GET_CALCULATIONS } from '@state/byModel/calculations/calculations.queries';

import { doCalculations } from './calculations'
import Table from './Table';
import CalcRowModal from './CalcRowModal';
import AddCard from './AddCard';
import Stock from './Stock';

export const StockPage: FunctionComponent = () => {

    const { ticker, tickertwo, securityOne, securityTwo, securityThree, securityFour, securityFive, securitySix, securitySeven, securityEight } = useParams();

    console.log({ ticker, tickertwo, securityOne, securityTwo, securityThree, securityFour, securityFive, securitySix, securitySeven, securityEight });

    const [showAddCard, setShowAddCard] = useState(false);
    const toggleShowAddCard = () => setShowAddCard(!showAddCard);

    const [visibleFinancials, setVisibleFinancials] = useState(() => 'pl');
    const handleVisibleFinancials = (event: React.MouseEvent<HTMLElement>, newFormats: string) => {
        setVisibleFinancials(newFormats);
    };

    const [showPercentage, setShowPercentage] = useState(false);
    const toggleShowPercentage = () => setShowPercentage(!showPercentage);

    const [showGraph, setShowGraph] = useState(true);
    const toggleShowGraph = () => console.log('here') || setShowGraph(!showGraph);

    return <ScrollSync>
        <>
            <Box pb={2}>
                {ticker ? (<CalcRowModal />) : null}
                <Grid container spacing={3} direction="row" wrap="nowrap">

                    {(ticker || securityOne) && (
                        <Grid item xs={(tickertwo || securityTwo) ? 6 : 11}>
                            <Stock
                                ticker={ticker || (securityOne && securityOne.replace('stock-', ''))}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    {(tickertwo || securityTwo) && (
                        <Grid item xs={6}>
                            <Stock
                                ticker={tickertwo || (securityTwo && securityTwo.replace('stock-', ''))}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    {securityThree && (
                        <Grid item xs={6}>
                            <Stock
                                ticker={securityThree.replace('stock-', '')}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    {securityFour && (
                        <Grid item xs={6}>
                            <Stock
                                ticker={securityFour.replace('stock-', '')}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    {securityFive && (
                        <Grid item xs={6}>
                            <Stock
                                ticker={securityFive.replace('stock-', '')}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    {securitySix && (
                        <Grid item xs={6}>
                            <Stock
                                ticker={securitySix.replace('stock-', '')}
                                visibleFinancials={visibleFinancials}
                                handleVisibleFinancials={handleVisibleFinancials}
                                showPercentage={showPercentage}
                                toggleShowPercentage={toggleShowPercentage}
                                showGraph={showGraph}
                                toggleShowGraph={toggleShowGraph}
                            />
                        </Grid>
                    )}

                    <Grid item xs={1}>
                        <Box
                            position="sticky"
                            top="88px"
                            display="flex"
                            mt={3}
                            zIndex={2}
                        >
                            <Box position="relative">
                                <IconButton color="primary" onClick={toggleShowAddCard}>
                                    <AddIcon />
                                </IconButton>
                                {showAddCard && (
                                    <ClickAwayListener
                                        onClickAway={toggleShowAddCard}
                                    >
                                        <Box position="absolute" right="0" top="0">
                                            <Card>
                                                <CardContent>
                                                    <MenuList
                                                    // id="simple-menuList-2"
                                                    // anchorEl={anchorEl}
                                                    // keepMounted
                                                    // open={Boolean(anchorEl)}
                                                    // onClose={handleClose}
                                                    >
                                                        <Box display="flex" flexDirection="column" justifyContent="center" alignContent="center">
                                                            <Box my={1} mx={2}>
                                                                <Button
                                                                    startIcon={`🏦`}
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    component={Link}
                                                                    to={`/stock/${ticker}/stock/BRKA`}
                                                                    fullWidth
                                                                >
                                                                    Berkshire
                                                            </Button>
                                                            </Box>
                                                            <Box my={1} mx={2}>
                                                                <Button
                                                                    startIcon={`👍`}
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    component={Link}
                                                                    to={`/stock/${ticker}/stock/FB`}
                                                                    fullWidth
                                                                >
                                                                    Facebook
                                                            </Button>
                                                            </Box>
                                                            <Box my={1} mx={2}>
                                                                <Button
                                                                    startIcon={`🛰`}
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    component={Link}
                                                                    to={`/stock/${ticker}/GOOG`}
                                                                    fullWidth
                                                                >
                                                                    Google
                                                            </Button>
                                                            </Box>
                                                            <Box my={1} mx={2}>
                                                                <Button
                                                                    startIcon={`🚛`}
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    component={Link}
                                                                    to={`/stock/${ticker}/stock/AMZN`}
                                                                    fullWidth
                                                                >
                                                                    Amazon
                                                            </Button>
                                                            </Box>
                                                            <Box my={1} mx={2}>
                                                                <Button
                                                                    startIcon={`🚘`}
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    component={Link}
                                                                    to={`/stock/${ticker}/TSLA`}
                                                                    fullWidth
                                                                >
                                                                    Tesla
                                                            </Button>
                                                            </Box>
                                                        </Box>
                                                    </MenuList>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    </ClickAwayListener>
                                )}
                            </Box>
                        </Box>

                        {/* {showAddCard && (
                            <>
                                <Box mt={2}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={8}>
                                            <Paper>
                                                <Box p={2} height={88}>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={4} container>
                                            <Box flex={1}>
                                                <Paper style={{ height: '100%' }}>
                                                    <Box
                                                        height={88}
                                                    ></Box>
                                                </Paper>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Paper>
                                    <Box m="16px" height={153}>
                                        <Box width="1000px" />
                                    </Box>
                                </Paper>

                                <Paper>
                                    <Box m="16px" height={227} />
                                </Paper>

                                <Paper>
                                    <Box m="16px" height={676} />
                                </Paper>
                            </>
                        )} */}
                    </Grid>
                </Grid>
            </Box>
        </>
    </ScrollSync>;
}
