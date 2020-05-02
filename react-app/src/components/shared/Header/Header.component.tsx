import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Grid, makeStyles, Box, Button } from '@material-ui/core';
import logoImg from '@assets/e-transparent.png';

import './style.sass';
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    logo: {
        'max-height': '50px',
        'padding-top': '3px'
    }
}));

import StockSearcher from './StockSearcher';

export default function Header() {
    const classes = useStyles();

    return (
        <AppBar position="sticky">
            <Toolbar>
                {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton> */}
                <Box mr={2}>
                    <img className={classes.logo} src={logoImg} />
                </Box>
                <Grid container direction="column">
                    <Grid item >
                        <Typography variant="h6">
                            Enron Avoider
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Box mt={-1}>
                            <Typography variant="subtitle1">
                                ask why.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid>
                    </Grid>
                </Grid>
                <Box display="flex" flexDirection="row">
                    <Box m={1}>
                        <Button
                            startIcon={`🏦`}
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/stock/BRKA"
                        >
                            Berkshire
                        </Button>
                    </Box>
                    <Box m={1}>
                        <Button
                            startIcon={`👍`}
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/stock/FB"
                        >
                            Facebook
                        </Button>
                    </Box>
                    <Box m={1}>
                        <Button
                            startIcon={`🛰`}
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/stock/GOOG"
                        >
                            Google
                        </Button>
                    </Box>
                    <Box m={1}>
                        <Button
                            startIcon={`🚛`}
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/stock/AMZN"
                        >
                            Amazon
                        </Button>
                    </Box>
                    <Box m={1}>
                        <Button
                            startIcon={`🚘`}
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/stock/TSLA"
                        >
                            Tesla
                        </Button>
                    </Box>
                </Box>
                <StockSearcher />
            </Toolbar>
        </AppBar>

        // <div className="Header">
        //     <nav className="navbar navbar-dark bg-primary shadow fixed-top">
        //         <a className="navbar-brand">Enron.Monster</a>
        //         <form className="form-inline">
        //             <StockSearcher />
        //         </form>
        //     </nav>
        // </div>
    );
}

