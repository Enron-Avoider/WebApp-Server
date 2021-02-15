import React, { useState, FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Link } from 'react-router-dom';
import ReactResizeDetector from 'react-resize-detector';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
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
import AddIcon from '@material-ui/icons/Add';

// import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
// import { GET_INDUSTRY, GET_SECTOR } from '@state/byModel/IndustriesAndSectors/industriesAndSectors.queries';
// import { GET_CALCULATIONS } from '@state/byModel/Calculations/calculations.queries';

// import { doCalculations } from './calculations'
// import Table from './Table';
import CalcRowModal from './CalcRowModal';
// import AddCard from './AddCard';
import Stock from './Stock';

export const StockPage: FunctionComponent = () => {

    const { ticker } = useParams<{ ticker: string }>();

    const [visibleFinancials, setVisibleFinancials] = useState(() => 'pl');
    const handleVisibleFinancials = (event: React.MouseEvent<HTMLElement>, newFormats: string) => {
        setVisibleFinancials(newFormats);
    };

    const [showPercentage, setShowPercentage] = useState(false);
    const toggleShowPercentage = () => setShowPercentage(!showPercentage);

    const [showGraph, setShowGraph] = useState(false);
    const toggleShowGraph = () => setShowGraph(!showGraph);

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
                            visibleFinancials={visibleFinancials}
                            handleVisibleFinancials={handleVisibleFinancials}
                            showPercentage={showPercentage}
                            toggleShowPercentage={toggleShowPercentage}
                            showGraph={showGraph}
                            toggleShowGraph={toggleShowGraph}
                        />
                    </Grid>
                </Grid>
            </Box>
        </>
    </ScrollSync>;
}
