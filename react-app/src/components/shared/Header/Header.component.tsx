import React from 'react';
import { useQuery } from "react-apollo";
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { Link as Link_ } from "react-router-dom";
import { Grid, Box, Link, Badge, Avatar, Button } from '@material-ui/core';

import logoImg from '@assets/e-transparent.png';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { GET_USER_KEYS } from "@state/byModel/User/UserKey.localQueries";
import { GET_USER_BY_ID } from '@state/byModel/User/User.queries';
import StockSearcher from '@components/shared/StockSearcher';
import LoginModal from './LoginModal';
import AlphaWarningModal from './AlphaWarningModal';

import './style.sass';

export default function Header() {

    const { loading: UserKeysLoading, error: UserKeysError, data: UserKeysData } = useQuery(GET_USER_KEYS);
    const { loading: UserByIdLoading, error: UserByIdError, data: UserByIdData } = useQuery(GET_USER_BY_ID, {
        variables: { id: UserKeysData?.userKeys?.length && UserKeysData?.userKeys[0].id },
        skip: !UserKeysData?.userKeys?.length
    });

    const user = UserByIdData?.getUserById;

    // console.log({
    //     UserKeysData,
    //     key: UserKeysData?.userKeys?.length && UserKeysData?.userKeys[0].id,
    //     UserByIdData
    // });

    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();

    return (
        <>
            <LoginModal />
            <AlphaWarningModal />
            <AppBar position="fixed">
                <Toolbar>
                    <Box display="flex" width={'100%'} justifyContent="space-between">

                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Box mr={1}>
                                <Link_ color="inherit" to={{
                                    pathname: `/home`,
                                    search: (getNewSearchParamsString({ paramsToAdd: { ticker: allSearchParams.ticker || 'AMZN' } }) as string)
                                }}>
                                    <img className="logo" src={logoImg} />
                                </Link_>
                            </Box>
                            <Badge
                                className="hide-on-mobile"
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                color="secondary"
                                badgeContent="⚠️ alpha"
                            >

                                <Grid container direction="column" justify="center">
                                    <Grid item >
                                        <Link component={Link_} color="inherit" to={{
                                            pathname: `/home`,
                                            search: (getNewSearchParamsString({ keysToRemove: ['ticker'] }) as string)
                                        }}>
                                            <Typography variant="h6">
                                                Enron Avoider
                                            </Typography>
                                        </Link>
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
                            </Badge>
                        </Box>

                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                        // ml={-22}
                        >
                            <Link
                                className="hide-on-mobile"
                                style={{
                                    ...window.location.pathname.includes('/stock/') && { fontWeight: 'bold' },
                                    // marginLeft: '5px'
                                }}
                                component={Link_}
                                color="inherit"
                                variant="subtitle1"
                                to={
                                    {
                                        pathname: `/stock/AMZN`,
                                        search: (getNewSearchParamsString({ keysToRemove: ['ticker'] }) as string)
                                    }
                                }
                                target="_blank"
                            >
                                Stock
                            </Link>
                            <Link
                                className="hide-on-mobile"
                                style={{
                                    ...window.location.pathname.includes('/ranking/') && { fontWeight: 'bold' },
                                    marginLeft: '15px'
                                }}
                                component={Link_}
                                color="inherit"
                                variant="subtitle1"
                                to={
                                    {
                                        pathname: `/ranking/pl.Total Revenue`,
                                        search: (getNewSearchParamsString({ paramsToAdd: { ticker: allSearchParams.ticker || 'AMZN' } }) as string)
                                    }
                                }
                                target="_blank"
                            >
                                Rank
                            </Link>
                            <Link
                                className="hide-on-mobile"
                                style={{
                                    marginLeft: '15px',
                                }}
                                component={Link_}
                                color="inherit"
                                variant="subtitle1"
                                to={
                                    {
                                        pathname: `/home`,
                                        search: (getNewSearchParamsString({ keysToRemove: ['ticker'] }) as string)
                                    }
                                }
                                target="_blank"
                            >
                                Explore
                            </Link>
                            <Box
                                ml={5}
                                display="flex"
                                width={210}
                            >
                                <StockSearcher />
                            </Box>
                        </Box>

                        <Box display="flex" overflow="visible" alignItems="center">
                            {/* <StockSearcher /> */}
                            <Typography variant="caption">
                                Currency in USD
                            </Typography>
                            <Box ml={1}>
                                {/* <Avatar alt="You" src="http://www.gstatic.com/tv/thumb/persons/73202/73202_v9_bb.jpg" /> */}
                                {user ? (
                                    <Avatar
                                        alt="You"
                                        title={user?.name}
                                        src={user?.avatarUrl || 'http://www.gstatic.com/tv/thumb/persons/73202/73202_v9_bb.jpg'}
                                    />
                                ) : (
                                    <Button
                                        onClick={() => updateParams({ search: getNewSearchParamsString({ paramsToAdd: { isRegistering: true } }) })}
                                    // color="primary"
                                    >
                                        Login
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box height={65} />
        </>

    );
}

