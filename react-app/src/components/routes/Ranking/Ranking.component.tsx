import React, { FunctionComponent } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
    Container
} from '@mui/material';
import { useParams } from "react-router-dom";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { useQuery } from "@apollo/client";

import getComparisonOptions from '@state/byModel/ComparisonOptions/ComparisonOptions.effect';
import ComparisonsPicker from '@components/shared/ComparisonsPicker';
import RowPicker from '@components/shared/RowPicker';
import RankingItem from './RankingItem';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';

import './style.sass';

export const Ranking: FunctionComponent<{}> = ({ }) => {

    const { row, collectionId } = useParams<{ row: string, collectionId?: string }>();
    const { pickedComparisonsOptions } = getComparisonOptions();
    const { allSearchParams } = useSearchParams();

    const { loading, error, data } = useQuery(GET_STOCK, {
        variables: { ticker: allSearchParams?.ticker },
        skip: !allSearchParams?.ticker
    });

    const stock = data && data.getStockByCode;

    // console.log({
    //     stock,
    //     collectionId,
    //     ticker: allSearchParams?.ticker
    // });

    return (
        <ScrollSync>
            <>
                <Box position="fixed" top={63} width="100%" left={0} zIndex={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper style={{ height: '100%' }}>
                                <Container>
                                    <Box display="flex" flexDirection="row" p={2}>
                                        <Box flex="1" maxWidth="100%">
                                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                                <Box display="flex" alignItems="center" mr={2}>
                                                    <Typography variant="h5">
                                                        <RowPicker />
                                                    </Typography>
                                                </Box>
                                                <ComparisonsPicker />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Container>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
                <Box height={80} width="100%"></Box>

                {pickedComparisonsOptions?.map(c => (
                    <RankingItem
                        key={c?.title}
                        comparison={c}
                        row={decodeURIComponent(row)}
                        collectionId={collectionId}
                        stock={stock}
                        ticker={allSearchParams?.ticker}
                    />
                ))}
            </>
        </ScrollSync>
    );
}

