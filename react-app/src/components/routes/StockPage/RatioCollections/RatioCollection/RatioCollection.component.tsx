import React, { FunctionComponent, useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery, useMutation } from "react-apollo";

import './style.sass';
import Table from '../../Table';
import { SAVE_RATIO_COLLECTION } from '@state/byModel/Calculations/calculations.queries';

export const RatioCollection: FunctionComponent<{
    ticker: string,
    stock: any,
    collection: any
}> = ({
    ticker,
    stock,
    collection
}) => {
        const [title, setTitle] = useState('');
        useEffect(() => {
            setTitle(collection.name);
        }, []);

        const [saveRatioCollection] = useMutation(SAVE_RATIO_COLLECTION);

        const debouncedSave = useDebouncedCallback(
            async (title: string) => await saveRatioCollection({
                variables: {
                    ratioCollection: {
                        ...collection,
                        name: title
                    }
                }
            }),
            2000
        );

        const onTitleEdit = (edit: string) => {
            debouncedSave.callback(edit);
            setTitle(edit);
        }

        // const { loading: loading__, error: error__, data: aggregate_for_todo } = useQuery(GET_AGGREGATE_FOR_FINANCIAL_ROWS, {
        //     variables: {
        //         // sector: stock.sector,
        //         industry: stock && stock.industry,
        //         // country: stock.country,
        //         // exchange: stock.exchange,
        //         ...calculations?.calculations.length && { calcs: calculations?.calculations }
        //     },
        //     skip: !stock
        // });

        return (
            <Grid item xs={(12) as any}>
                <Paper elevation={5}>
                    <Box mb={-3}>
                        <Table
                            ticker={ticker}
                            title={title}
                            years={stock.yearlyFinancials.years}
                            data={collection.calculationResults}
                            onTitleEdit={onTitleEdit}
                            newCalcCollection={`${collection.name}.${collection.id}`}
                        />
                    </Box>
                </Paper>
            </Grid>
        );
    }

