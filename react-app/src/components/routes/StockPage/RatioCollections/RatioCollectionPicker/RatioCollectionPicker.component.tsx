import React, { useState, FunctionComponent, useContext } from "react";
import {
    Box,
    Chip,
    TextField,
    Autocomplete
} from '@mui/material';

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import "./style.sass";

export const RatioCollectionPicker: FunctionComponent<{ ratioCollections: any }> = ({ ratioCollections }) => {
    const {
        allSearchParams, getNewSearchParamsString, updateParams
    } = useSearchParams();

    const options: { value: string, title: string, type: string }[] = ratioCollections ?
        ratioCollections?.map((c: any) => ({
            value: c.id,
            title: c.name,
            type: c.isOwnedByPlatform ? 'system' : c.isOwnedByUser ? 'yours' : 'other user\'s'
        })) : [];

    const pickedChosenCollections = allSearchParams.ratioCollections?.length ? (
        ids => ids?.map(
            (n: any) => options.find((c: any) => c.value === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.ratioCollections?.split('-').map(c => c.split('.')[1])) : [];

    const handleCollectionToggle = (e: any, { v }: any) => {
        console.log({ v });
        updateParams({
            search: getNewSearchParamsString({
                ...v.length && {
                    paramsToAdd: {
                        ratioCollections: v.reduce((p: any, c: any) => `${p ? p + '-' : ''}${c.title}.${c.value}`, '')
                    }
                },
                ...!v.length && {
                    keysToRemove: ['ratioCollections']
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
                    options={options}
                    getOptionLabel={option => option ? option?.title : ''}
                    value={pickedChosenCollections}
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
                        handleCollectionToggle(event, { v: newInputValue });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={`Selected Ratio Collections`}
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
