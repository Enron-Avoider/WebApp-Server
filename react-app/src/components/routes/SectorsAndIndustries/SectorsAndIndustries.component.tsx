import React from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    IconButton,
    ClickAwayListener,
    MenuList,
    Button,
    Card,
    CardContent
} from '@material-ui/core';

import Industries from './Industries';
import Sectors from './Sectors';
import './style.sass';

export default function SectorsAndIndustries() {
    return (
        <>
            <p>SectorsAndIndustries</p>
            <Box pb={2}>
                <Grid container spacing={3} direction="row" wrap="nowrap">
                    <Grid item xs={6}>
                        <Industries />
                    </Grid>
                    <Grid item xs={6}>
                        <Sectors />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

