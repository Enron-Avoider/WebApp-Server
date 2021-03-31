import React, { FunctionComponent } from 'react';
import {
    Paper,
    Grid,
    Box,
    Container,
    Typography,
    Avatar,
    Link,
    SvgIcon
} from '@material-ui/core';

import { discordSVGPath, discordSVGViewBox } from "@assets/icon-paths/discord";
import './style.sass';

export const Home: FunctionComponent<{}> = ({ }) => {
    return (
        <Box pb={2}>
            <Grid container justify="center">
                <Grid item md={8} xs={10}>

                    <Box p={2} mt={2}>
                        <Typography variant="h4">
                            Letter to users
                        </Typography>
                    </Box>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Typography variant="h5">
                                Welcome!
                            </Typography>

                            <p>
                                Enron Avoider contains a set of tools built
                                for learning value investing.
                            </p>
                            <p>
                                The tools will expand based on value investing
                                questions for which we can't find good enough solutions to elsewhere.
                            </p>
                            <p>
                                We aspire to hosting a small, Open Source, Value Investing community
                                looking to share, acquire and consolidate wisdom.
                            </p>

                        </Box>
                    </Paper>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Typography variant="h5">
                                Main tools
                            </Typography>

                            <p>
                                Custom ratio calculator.
                            </p>

                            <p>
                                Custom aggregation for each Financial Row or Calculated Ratio.
                            </p>

                            <p>
                                Yearly Ranking Table by Financial Row or Calculated Ratio, for Aggregations.
                            </p>

                        </Box>
                    </Paper>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Typography variant="h5">
                                Tools in development
                            </Typography>

                            <p>
                                We'll soon let you know.
                            </p>

                        </Box>
                    </Paper>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Typography variant="h5">
                                Pricing
                            </Typography>

                            <p>
                                Enron Avoider is currently free, and we have no intention of ever
                                being profitable. <br />
                                Hopefully we won't have many users, so
                                our server costs stay low, and we can remain free.
                            </p>

                        </Box>
                    </Paper>

                    <Paper>
                        <Box p={2} mt={2}>

                            <Typography variant="h5">
                                Community
                            </Typography>

                            <p>
                                We have created a {' '}
                                <Link href="https://discord.gg/NBgpx5guRe" color="primary" target="_blank">
                                    <SvgIcon fontSize="inherit" viewBox={discordSVGViewBox}>
                                        <path d={discordSVGPath} />
                                    </SvgIcon>{' '}
                                        Discord Chat Server
                                </Link>{' '}
                                and enabled comments with Disqus for each Stock and Custom Ratio.
                            </p>

                            <p>
                                The intent is to accommodate for a very small, respectful and
                                curious community of value investors.
                            </p>

                        </Box>
                    </Paper>

                    <Box p={2} mt={2}>
                        <p>
                            March 31, 2021 <br />
                            <Link href="https://twitter.com/esperancaJS" color="primary" target="_blank">
                                Pedro Esperança
                            </Link>
                        </p>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

