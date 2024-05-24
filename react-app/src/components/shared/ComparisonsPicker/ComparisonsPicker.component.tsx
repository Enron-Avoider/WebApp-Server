import React, { useState, FunctionComponent, useContext } from "react";
import { useQuery } from "@apollo/client";
import {
    Box,
    Chip,
    TextField,
    Autocomplete
} from '@mui/material';

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import getComparisonOptions from '@state/byModel/ComparisonOptions/ComparisonOptions.effect';

import './style.sass';

export const ComparisonsPicker: FunctionComponent<{}> = ({ }) => {
    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();
    const { comparisonOptions } = getComparisonOptions();

    const pickedComparisons = allSearchParams.comparisons ? (
        ids => ids?.map(
            (n: any) => comparisonOptions.find((c: any) => c.value === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.comparisons?.split('-')) : [];

    // console.log({
    //     pickedComparisons,
    //     // c: allSearchParams.comparisons,
    //     // c1: allSearchParams.comparisons?.split('-'),
    // });

    const handleComparisonToggle = (e: any, { v }: any) => {
        updateParams({
            search: getNewSearchParamsString({
                ...v.length && {
                    paramsToAdd: {
                        comparisons: v.reduce((p: any, c: any) => `${p ? p + '-' : ''}${c.value}`, '')
                    }
                },
                ...!v.length && {
                    keysToRemove: ['comparisons']
                }
            })
        })
    }

    return (
        <>
            <Box width={465}>
                <Autocomplete
                    multiple
                    autoComplete
                    autoHighlight
                    // autoSelect
                    limitTags={2}
                    disableListWrap
                    options={comparisonOptions}
                    getOptionLabel={option => option ? option?.title : ''}
                    value={pickedComparisons}
                    // inputValue={v}
                    // onInputChange={(_, newInputValue) => {
                    //     console.log({
                    //         newInputValue
                    //     });
                    // }}
                    // defaultValue={v}
                    groupBy={option => `${option?.type}`}
                    // forcePopupIcon={false}
                    onChange={(event, newInputValue) => {
                        handleComparisonToggle(event, { v: newInputValue });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={`Compare with`}
                            placeholder=""
                        />
                    )}
                    renderTags={(value: any[], getTagProps) =>
                        value.map((option: any, index: number) => {
                            return (
                                <Chip
                                    label={`${option.type}: ${option.title}`}
                                    {...getTagProps({ index })}
                                    className={`${option.type}`}
                                    // color={'default'}
                                    onDelete={undefined}
                                    onClick={(getTagProps({ index }) as any).onDelete}
                                />
                            )
                        })
                    }
                />
            </Box>
        </>
    );
}

