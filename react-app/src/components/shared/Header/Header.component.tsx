import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Grid, Box, Button, Menu, MenuItem, useMediaQuery, Badge } from '@material-ui/core';
import { useTheme, makeStyles } from '@material-ui/core/styles';

import logoImg from '@assets/e-transparent.png';
import StockSearcher from '@components/shared/StockSearcher';

import './style.sass';

const useStyles = makeStyles((theme) => ({
    logo: {
        'max-height': '50px',
        'padding-top': '3px'
    }
}));

export default function Header() {
    const classes = useStyles();
    const theme = useTheme();
    const sm = useMediaQuery(theme.breakpoints.down('sm'));

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

