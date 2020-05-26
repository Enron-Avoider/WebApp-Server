import React from 'react';
import { Box, Link } from '@material-ui/core';

import './style.sass';

export default function Footer() {
    return (
        <>
            <Box pt={4}></Box>
            <hr />
            <Box pb={4}>
                <Box>
                    <b>Why</b>: The less boring Data is, the easiest it is to look deeper.
                </Box>
                <Box>
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
                </Box>
            </Box>
        </>
    );
}

