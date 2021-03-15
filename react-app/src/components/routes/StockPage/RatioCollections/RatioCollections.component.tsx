import React, { FunctionComponent } from 'react';
import { useQuery } from "react-apollo";
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@material-ui/core';

import './style.sass';
import { doCalculations } from '../calculations.map';
import RatioCollectionPicker from './RatioCollectionPicker';
import RatioCollection from './RatioCollection';
import { GET_RATIO_COLLECTIONS, GET_CALCULATIONS } from '@state/byModel/Calculations/calculations.queries';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import getCalculations from '@state/byModel/Calculations/getCalculations.effect';

export const RatioCollections: FunctionComponent<{
    ticker: string, stock: any
}> = ({ ticker, stock }) => {

    const { ratioCollections, pickedCollectionsWithCalculations } = getCalculations({ stock });

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

                    <RatioCollectionPicker ratioCollections={ratioCollections} />
                </Box>

                <Box mx={-1} mb={-2}>
                    <Grid container spacing={3}>
                        {pickedCollectionsWithCalculations?.map((c, i) => (
                            <RatioCollection
                                key={c.name+i}
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

