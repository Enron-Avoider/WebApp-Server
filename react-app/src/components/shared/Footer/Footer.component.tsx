import React from 'react';
import { Box, Link } from '@material-ui/core';

import './style.sass';

export default function Footer() {
    return (
        <Box py={4}>

            <Box>
                <b>Data from</b>:
                {' '}
                <Link href="https://simfin.com/" color="primary" target="_blank">
                    SimFin
                </Link>{' '}
                (they are awesome!)
            </Box>
            <Box>
                <b>Pricing</b>: Free for the first 50 registered users.
            </Box>
            <Box>
                <p>
                    Would you like us figure out what to do next?{' '}
                    <Link href="//google.com" color="primary" target="_blank">
                        Join
                    </Link>{' '}
                    our next Video Call to discuss new features!
                </p>
            </Box>
        </Box>
    );
}

