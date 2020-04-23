import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Grid, makeStyles } from '@material-ui/core';

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
}));

import StockSearcher from './StockSearcher';

export default function Header() {
    const classes = useStyles();

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Grid container direction="column">
                    <Grid item >
                        <Typography variant="h6">
                            Enron Monster
                        </Typography>
                    </Grid>
                    <Grid item >
                        <Typography variant="subtitle1">
                            (best name ever, shut up, it is)
                        </Typography>
                    </Grid>
                </Grid>
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

