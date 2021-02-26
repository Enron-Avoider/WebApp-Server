import React, { useState, FunctionComponent, useContext } from "react";
import { useQuery } from "react-apollo";
import {
    Box,
    Chip,
    TextField
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useLazyQuery } from "react-apollo";

import { GET_LAST_YEAR_COUNTS } from '@state/byModel/Aggregate/aggregate.queries';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import './style.sass';

export const ComparisonsPicker: FunctionComponent<{}> = ({ }) => {
    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();

    const { loading: lastYearCounts_loading, error: lastYearCounts_error, data: lastYearCounts } = useQuery(GET_LAST_YEAR_COUNTS, {
        variables: {
            query: {}
        }
    });

    const options: { value: string, title: string, type: string }[] = [
        {
            value: 'Stock_Related__Industry',
            title: 'Industry',
            type: 'Stock Related'
        }, {
            value: 'Stock_Related__Sector',
            title: 'Sector',
            type: 'Stock Related'
        }, {
            value: 'Stock_Related__Country',
            title: 'Country',
            type: 'Stock Related'
        }, {
            value: 'Stock_Related__Exchange',
            title: 'Exchange',
            type: 'Stock Related'
        },
        ...(lastYearCounts?.getLastYearCounts?.counts.country) ?
            lastYearCounts?.getLastYearCounts?.counts?.country?.map((c: any) => ({
                value: `country__${c._id?.replace(" ","_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Country'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.exchange) ?
            lastYearCounts?.getLastYearCounts?.counts?.exchange?.map((c: any) => ({
                value: `exchange__${c._id?.replace(" ","_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Exchange'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.sector) ?
            lastYearCounts?.getLastYearCounts?.counts?.sector?.map((c: any) => ({
                value: `sector__${c._id?.replace(" ","_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Sector'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.industry) ?
            lastYearCounts?.getLastYearCounts?.counts?.industry?.map((c: any) => ({
                value: `industry__${c._id?.replace(" ","_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Industry'
            })) :
            []
        // ... true && []
    ];

    const pickedComparisons = allSearchParams.comparisons ? (
        ids => ids?.map(
            (n: any) => options.find((c: any) => c.value === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.comparisons?.split('-')) : [];

    // console.log({
    //     pickedComparisons,
    //     c: allSearchParams.comparisons,
    //     c1: allSearchParams.comparisons?.split('-'),
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
            <Box width={350}>
                <Autocomplete
                    multiple
                    autoComplete
                    autoHighlight
                    // autoSelect
                    limitTags={1}
                    disableListWrap
                    options={options}
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
                            label={`Selected Comparisons`}
                            placeholder=""
                        />
                    )}
                    renderTags={(value: any[], getTagProps) =>
                        value.map((option: any, index: number) => {
                            return (
                                <Chip
                                    label={`[${option.type}] ${option.title}`}
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

