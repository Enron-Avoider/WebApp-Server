import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Grid, Box, Link, Badge } from '@material-ui/core';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { useQuery } from "react-apollo";

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import logoImg from '@assets/e-transparent.png';
import StockSearcher from '@components/shared/StockSearcher';

import './style.sass';

export default function Header() {

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <Box display="flex" width={'100%'} justifyContent="space-between">
                        <Badge
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            color="secondary"
                            badgeContent="⚠️ alpha"
                        >
                            <>
                                <Box mr={2}>
                                    <img className="logo" src={logoImg} />
                                </Box>
                                <Grid container direction="column" justify="center">
                                    <Grid item >
                                        <Typography variant="h6">
                                            Enron Avoider
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Box mt={-1}>
                                            <Link color="inherit" href="https://www.youtube.com/watch?v=NsHxKoYhs3U" target="_blank">
                                                <Typography variant="subtitle1">
                                                    ask why.
                                                </Typography>
                                            </Link>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        </Badge>

                        <Box display="flex" overflow="visible" alignItems="center">
                            <StockSearcher />
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box height={65} />
        </>

    );
}

