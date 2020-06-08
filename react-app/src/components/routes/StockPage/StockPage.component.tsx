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
    InputLabel,
    MenuListItem,
    ListSubheader,
    FormControl,
    Select,
    IconButton,
    ClickAwayListener,
    MenuList,
    Button
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import TICKER_QUERY from '@state/graphql-queries/ticker';
import { GET_CALCULATIONS } from '@state/graphql-queries/calculations';
import getCalculations from '@state/effects/getCalculations';

import { doCalculations } from './calculations'
import Table from './Table';
import CalcRowModal from './CalcRowModal';
import AddCard from './AddCard';

export const StockPage: FunctionComponent = () => {

    const { ticker } = useParams();
    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });
    const { loading: loading_, error: error_, data: calculations } = useQuery(GET_CALCULATIONS, {
        variables: { ticker },
    });
    const stock = data && data.getSimfinCompanyByTicker;
    const calculationResults = stock && doCalculations(calculations?.calculations, stock.years, stock);
    // getQuartiles
    // getCorrelation
    // getRegression

    const [visibleFinancials, setVisibleFinancials] = useState(() => ['pl']);
    const handleVisibleFinancials = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
        setVisibleFinancials(newFormats);
    };

    const [showAddCard, setShowAddCard] = useState(false);
    const toggleShowAddCard = () => setShowAddCard(!showAddCard);

    // console.log({ stock, calc });
    // console.log({ calc });

    return !loading && !error ? (
        <ScrollSync>
            <>
                <Box pb={2}>
                    <CalcRowModal />
                    <Grid container spacing={3}>

                        <Grid item xs={11}>
                            <>

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
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box
                                            p={2}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            height="100%"
                                        >
                                            <Avatar variant="rounded" src={stock.logo} />
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Paper>
                                    <Table
                                        title={'Calculations'}
                                        years={stock.years}
                                        data={calculationResults}
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
                            </>
                        </Grid>

                        <Grid item xs={1}>
                            <Box
                                position="sticky"
                                top="88px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mt={3}
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
                                                <MenuList
                                                    id="simple-menuList-2"
                                                    // anchorEl={anchorEl}
                                                    keepMounted
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
                                                                to="/stock/BRKA"
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
                                                                to="/stock/FB"
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
                                                                to="/stock/GOOG"
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
                                                                to="/stock/AMZN"
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
                                                                to="/stock/TSLA"
                                                                fullWidth
                                                            >
                                                                Tesla
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </MenuList>
                                            </Box>
                                        </ClickAwayListener>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </>
        </ScrollSync>
    ) : (
            <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress size={100} />
            </Box>
        );
}
