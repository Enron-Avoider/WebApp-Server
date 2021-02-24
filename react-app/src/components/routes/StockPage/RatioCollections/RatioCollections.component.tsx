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

export const RatioCollections: FunctionComponent<{
    ticker: string, stock: any
}> = ({ ticker, stock }) => {
    const { allSearchParams } = useSearchParams();

    const { loading: ratioCollections_loading, error: ratioCollections_error, data: ratioCollectionsQ } = useQuery(GET_RATIO_COLLECTIONS, {
        variables: { ticker },
        skip: !ticker
    });

    const ratioCollections = ratioCollectionsQ?.getRatioCollections;

    const pickedCollections = ratioCollections ? (
        ids => ids?.map(
            (n: any) => ratioCollections.find((c: any) => c.id === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.ratioCollections?.split('-').map(c => c.split('.')[1])) : [];

    const pickedCollectionsWithCalculations = pickedCollections?.map(c => ({
        ...c,
        calculationResults: doCalculations(c.calcs, stock.yearlyFinancials.years, stock)
    }));

    // console.log({
    //     // ratioCollections,
    //     // pickedCollections,
    //     pickedCollectionsWithCalculations
    // });

    return (
        <Paper>
            <Box p={2} mt={2} pb={5} minHeight={85}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography variant="h5">
                        Ratios
                    </Typography>

                    <RatioCollectionPicker ratioCollections={ratioCollections} />
                </Box>

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
        </Paper>
    );
}

