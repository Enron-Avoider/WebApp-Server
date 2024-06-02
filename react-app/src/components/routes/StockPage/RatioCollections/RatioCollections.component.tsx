import React, { FunctionComponent } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import './style.sass';
import RatioCollectionPicker from './RatioCollectionPicker';
import RatioCollection from './RatioCollection';
import getCalculations from '@state/byModel/Calculations/getCalculations.effect';

export const RatioCollections: FunctionComponent<{
    ticker: string, stock: any
}> = ({ ticker, stock }) => {

    const { ratioCollections, pickedCollectionsWithCalculations, ratioCollections_loading } = getCalculations({ stock });

    return (
        <Paper>
            <Box p={2} mt={2} pb={5} minHeight={85}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography variant="h5">
                        Ratio Collections
                    </Typography>

                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mr={3}
                    >
                        {ratioCollections_loading && <CircularProgress />}
                    </Box>

                    <RatioCollectionPicker ratioCollections={ratioCollections} />
                </Box>

                <Box mx={-1} mb={-2}>
                    <Grid container spacing={3}>
                        {pickedCollectionsWithCalculations?.map((c, i) => (
                            <RatioCollection
                                key={c.name + i}
                                ticker={ticker}
                                stock={stock}
                                collection={c}
                            />
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
}

