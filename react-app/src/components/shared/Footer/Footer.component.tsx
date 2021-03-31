import React from 'react';
import { Box, Link, Avatar, SvgIcon } from '@material-ui/core';
import { Twitter } from '@material-ui/icons';
// import { Grid, Box, Button, Menu, MenuItem, useMediaQuery, Badge } from '@material-ui/core';

import PercentagePath from "@assets/icon-paths/percentage";
import { discordSVGPath, discordSVGViewBox } from "@assets/icon-paths/discord";

import './style.sass';

export default function Footer() {
    return (
        <>
            <Box pt={4}></Box>
            <hr />
            <Box pb={4}>
                {/* <Box display="flex">
                    <b>But Why</b>:
                    <Box ml={1}>
                        
                    </Box>
                </Box> */}
                <Box display="flex">
                    <b>By Who</b>:
                    <Box ml={1}>
                        <Link href="https://twitter.com/esperancaJS" color="primary" target="_blank">
                            <Box display="flex" alignItems="center">
                                <Twitter fontSize="inherit" />{' '}
                                @esperancaJS
                            </Box>
                        </Link>
                    </Box>
                </Box>
                <Box display="flex">
                    <b>Feedback</b>:
                    <Box ml={1}>
                        <Link href="https://discord.gg/NBgpx5guRe" color="primary" target="_blank">
                            <Box display="flex" alignItems="center">
                                <SvgIcon fontSize="inherit" viewBox={discordSVGViewBox}>
                                    <path d={discordSVGPath} />
                                </SvgIcon>{' '}
                                Join us!
                            </Box>
                        </Link>
                    </Box>
                </Box>
                <Box display="flex">
                    <b>Pricing</b>:
                    <Box ml={1}>
                        Free for now
                    </Box>
                </Box>
                <Box display="flex">
                    <b>Data Groomed by</b>:
                    <Box ml={1}>
                        <Link href="https://datagatherers.com/" color="primary" target="_blank">
                            <Box display="flex" alignItems="center">
                                Data Gatherers
                            </Box>
                        </Link>
                    </Box>
                </Box>

            </Box>
        </>
    );
}

