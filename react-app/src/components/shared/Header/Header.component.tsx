import React from 'react';
import { useParams } from 'react-router-dom';
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
    const { ticker } = useParams<{ ticker: string }>();

    const { loading, error, data } = useQuery(GET_STOCK, {
        variables: { ticker },
        skip: !ticker
    });
    const stock = data && data.getStockByCode;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

                            {/* <>
                                <Box display="flex" flexDirection="row">
                                    <Box m={1}>
                                        <Button
                                            // startIcon={`🏦`}
                                            variant="contained"
                                            color="secondary"
                                            component={Link}
                                            to="/stock/BRK-B"
                                        >
                                            Berkshire
                                        </Button>
                                    </Box>

                                    <Box m={1}>
                                        <Button
                                            // startIcon={`👍`}
                                            variant="contained"
                                            color="secondary"
                                            component={Link}
                                            to="/stock/FB"
                                        >
                                            Facebook
                                        </Button>
                                    </Box>
                                </Box>
                            </> */}

                            {/* {!sm && ( */}
                            <StockSearcher />
                            {/* )} */}

                            {/* {sm && (
                                <Box ml={2}>
                                    <IconButton aria-label="menu" onClick={handleClick}>
                                        <MenuIcon />
                                    </IconButton>

                                    <Menu
                                        id="simple-menu"
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                    >
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignContent="center">
                                            <Box my={1} mx={2}>
                                                <StockSearcher />
                                            </Box>
                                        </Box>
                                    </Menu>
                                </Box>
                            )} */}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box height={65} />
        </>

    );
}

