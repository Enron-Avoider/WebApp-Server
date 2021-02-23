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
import Table from '../Table';
import { doCalculations } from '../calculations.map';
import RatioCollectionPicker from '../RatioCollectionPicker';
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

    const pickedChosenCollections = ratioCollections ? (
        ids => ids?.map(
            (n: any) => ratioCollections.find((c: any) => c.id === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.ratioCollections?.split('-').map(c => c.split('.')[1])) : [];

    const pickedChosenCollectionsWithCalculations = pickedChosenCollections?.map(c => ({
        ...c,
        calculationResults: doCalculations(c.calcs, stock.yearlyFinancials.years, stock)
    }));

    // console.log({
    //     ratioCollections,
    //     pickedChosenCollections,
    //     pickedChosenCollectionsWithCalculations
    // });

    return (
        <Paper>
            <Box p={2} mt={2} minHeight={85}>
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
                    {pickedChosenCollectionsWithCalculations?.map((c, i) => (
                        <Grid key={i} item xs={(12) as any}>
                            <Paper elevation={5}>
                                <Table
                                    ticker={ticker}
                                    title={c.name}
                                    years={stock.yearlyFinancials.years}
                                    data={c.calculationResults}
                                    onTitleEdit={(edit: string) => console.log(edit)}
                                    newCalcCollection={`${c.name}.${c.id}`}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Paper>
    );
}

