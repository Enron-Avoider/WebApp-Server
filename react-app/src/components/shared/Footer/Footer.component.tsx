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
                    <b>Community</b>:
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

                {/* <Box>
                    <b>Data from</b>:
                    {' '}
                    <Link href="https://simfin.com/" color="primary" target="_blank">
                        SimFin
                    </Link>{' '}
                    (they are awesome!)
                </Box>
                <Box>
                    <b>Pricing</b>: Free for the first 50 registered users.{' '}
                    <Link href="#" color="primary" target="_blank">
                        Register
                    </Link>{' '}
                </Box>
                <Box>
                    <b>We don't know what we are doing yet.</b>{' '}⚠️
                </Box>
                <Box>
                    <b>When AI?</b>: When we grasps what we can see well enough to be able to analyse critically AI's inferences.
                </Box>
                <Box mt={2}>
                    Would you like us figure out what to do next?{' '}
                    <Link href="#" color="primary" target="_blank">
                        Join
                    </Link>{' '}
                    our next Video Call to discuss new features!
                </Box> */}
            </Box>
        </>
    );
}

