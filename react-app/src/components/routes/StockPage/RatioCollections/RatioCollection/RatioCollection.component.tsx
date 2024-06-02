import React, { FunctionComponent, useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery, useMutation } from "@apollo/client";

import './style.sass';
import Table from '../../Table';
import NewCalcRowButton from '../../NewCalcRowButton';
import { SAVE_RATIO_COLLECTION } from '@state/byModel/Calculations/calculations.queries';
import { GET_AGGREGATES_FOR_CALC_ROWS } from '@state/byModel/Aggregate/aggregate.queries';
import getComparisonOptions from '@state/byModel/ComparisonOptions/ComparisonOptions.effect';
import { mergeCalculationsAndAggregates } from '@state/byModel/Stocks/stock.map';
import { GET_USER_KEYS } from '@state/byModel/User/UserKey.localQueries';

export const RatioCollection: FunctionComponent<{
    ticker: string,
    stock: any,
    collection: any
}> = ({
    ticker,
    stock,
    collection
}) => {

        const { loading: UserKeysLoading, error: UserKeysError, data: UserKeysData } = useQuery(GET_USER_KEYS);
        const userKey = UserKeysData?.userKeys?.length && UserKeysData?.userKeys[0].id;
        const { pickedComparisons } = getComparisonOptions();

        const [title, setTitle] = useState('');
        useEffect(() => {
            setTitle(collection.name || '');
        }, []);

        const [saveRatioCollection] = useMutation(SAVE_RATIO_COLLECTION);

        const debouncedSave = useDebouncedCallback(
            async (title: string) => await saveRatioCollection({
                variables: {
                    ratioCollection: {
                        ...collection,
                        name: title
                    },
                    userId: userKey
                }
            }),
            2000
        );

        const onTitleEdit = (edit: string) => {
            debouncedSave.callback(edit);
            setTitle(edit);
        }

        console.log({ collection });

        const {
            loading: loading_aggregatesForCalcRows,
            error: error_aggregatesForCalcRows,
            data: aggregatesForCalcRows
        } = useQuery(GET_AGGREGATES_FOR_CALC_ROWS({
            aggregatesList: stock && pickedComparisons || [],
            stock,
            collectionId: collection.id,
            calcs: collection.calcs
        }), {
            skip: !stock || !pickedComparisons
        });

        const mergedCalculationsAndAggregates = mergeCalculationsAndAggregates({
            calculations: collection.calculationResults,
            aggregates: aggregatesForCalcRows,
            collectionId: collection.id
        })

        return (
            <Grid item xs={(12) as any}>
                <Paper elevation={5}>
                    <Box mb={-3}>
                        <Table
                            ticker={ticker}
                            title={title}
                            years={stock.yearlyFinancials?.years}
                            // data={collection.calculationResults}
                            data={
                                mergedCalculationsAndAggregates ||
                                collection.calculationResults
                            }
                            onTitleEdit={onTitleEdit}
                            collectionName={`${collection.name}`}
                            isCollectionOwner={collection.isOwnedByUser}
                            loading={loading_aggregatesForCalcRows}
                        />
                    </Box>

                    {collection.isOwnedByUser ? (
                        <NewCalcRowButton
                            title=""
                            ticker={ticker}
                            collectionName={collection.name}
                        />
                    ) : null}
                </Paper>
            </Grid>
        );
    }

