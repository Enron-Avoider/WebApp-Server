import React, { useState, FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Paper, Grid, Box, Typography, Avatar } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import TICKER_QUERY from '@state/graphql-queries/ticker';
import { GET_CALCULATIONS } from '@state/graphql-queries/calculations';
import getCalculations from '@state/effects/getCalculations';

import { doCalculations } from './calculations'
import Table from './Table';
import CalcRowModal from './CalcRowModal';

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

    // console.log({ stock, calc });
    // console.log({ calc });

    return !loading && !error ? (
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
                    <Paper style={{ height: 'calc(100% - 16px)' }}>
                        <Box display="flex" flexDirection="column" justifyContent="space-around" p={2} mt={2}>
                            <Box flex="1">
                                <FormControl style={{ width: '100%' }}>
                                    <InputLabel htmlFor="grouped-select">⍴ Correlation</InputLabel>
                                    <Select defaultValue="" id="grouped-select">
                                        <MenuItem value="">
                                            <em>⍴ between selected and all</em>
                                        </MenuItem>
                                        <ListSubheader>Category 1</ListSubheader>
                                        <MenuItem value={1}>Option 1</MenuItem>
                                        <MenuItem value={2}>Option 2</MenuItem>
                                        <ListSubheader>Category 2</ListSubheader>
                                        <MenuItem value={3}>Option 3</MenuItem>
                                        <MenuItem value={4}>Option 4</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <ScrollSync><>

                <CalcRowModal />

                {/* <Paper>
                    <Table
                        title={'Charts'}
                        years={stock.years}
                        data={calc}
                    />
                </Paper> */}

                <Paper>
                    <Box display="flex" m={2}>
                        <Box pr={2} py={2}>
                            <Typography variant="h4">
                                Map
                            </Typography>
                            <Typography variant="h5">
                                Calculate between Same Row
                            </Typography>
                            <Typography variant="body1">
                                - change
                            </Typography>

                            <Typography variant="h5">
                                Calculate between Rows
                            </Typography>
                            <Typography variant="body1">
                                - ratios
                            </Typography>
                        </Box>
                        <Box pl={2} py={2}>
                            <Typography variant="h4">
                                Reduce
                            </Typography>
                            <Typography variant="h5">
                                Regress between Rows
                            </Typography>
                            <Typography variant="body1">
                                - correlation
                            </Typography>

                            <Typography variant="h5">
                                Regress between same Row
                            </Typography>
                            <Typography variant="body1">
                                - mean <br />
                                - percentiles
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

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
            </></ScrollSync>
        </Box>
    ) : (
            <Box p={5} m={5} height="100vh" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress size={100} />
            </Box>
        );
}
