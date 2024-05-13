import React, { FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import {
    Grid,
    Box,
} from '@mui/material';

import CalcRowModal from './CalcRowModal';
import Stock from './Stock';

export const StockPage: FunctionComponent = () => {
    const { ticker } = useParams<{ ticker: string }>();

    return <ScrollSync>
        <>
            <Box pb={2}>
                {(ticker) && (
                    <CalcRowModal />
                )}
                <Grid container direction="row" wrap="nowrap">
                    <Grid item xs={12}>
                        <Stock
                            ticker={ticker}
                        />
                    </Grid>
                </Grid>
            </Box>
        </>
    </ScrollSync>;
}
