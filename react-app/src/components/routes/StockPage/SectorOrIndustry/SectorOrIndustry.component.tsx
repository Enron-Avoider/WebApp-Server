import React from 'react';

import './style.sass';

export default function SectorOrIndustry() {
    return (
        <>
{!loading__ && !error__ && false && (
                        <Grid item xs={7}>
                            <>

                                <Box mt={2}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={8}>
                                            <Paper>
                                                <Box display="flex" flexDirection="row" p={2}>
                                                    <div>
                                                        <Box display="flex" alignItems="center">
                                                            <Typography variant="h5">
                                                                {industry.name}
                                                            </Typography>
                                                            {/* <Box ml={1}>
                                                                    <Typography variant="h5">
                                                                        <b>({ticker})</b>
                                                                    </Typography>
                                                                </Box> */}
                                                        </Box>
                                                        <div>
                                                            {/* <p>Employees: {stock.employees}</p> */}
                                                            <Typography variant="body1">{' '}</Typography>

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
                                                    {/* <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            height="100%"
                                                        >
                                                            <Avatar variant="rounded" src={stock.logo} />
                                                        </Box> */}
                                                </Paper>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* <Paper>
                                        <Table
                                            title={'Calculations'}
                                            years={industry.yearlyFinancialsAddedUp.years}
                                            data={calculationResults}
                                        />
                                    </Paper> */}

                                {/* <Paper>
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
                                    </Paper> */}

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
                                                            years={industry.yearlyFinancialsAddedUp.years}
                                                            data={[
                                                                ...industry.yearlyFinancialsAddedUp.pl,
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
                                                            years={industry.yearlyFinancialsAddedUp.years}
                                                            data={industry.yearlyFinancialsAddedUp.bs}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            )}
                                            {visibleFinancials.includes('cf') && (
                                                <Grid item xs={(12 / visibleFinancials.length) as any}>
                                                    <Paper elevation={5}>
                                                        <Table
                                                            title={'Cash Flow'}
                                                            years={industry.yearlyFinancialsAddedUp.years}
                                                            data={industry.yearlyFinancialsAddedUp.cf}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </Paper>
                            </>
                        </Grid>
                    )}
        </>
    );
}

