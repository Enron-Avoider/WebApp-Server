import React, { useState, FunctionComponent, useContext } from "react";
import {
    Box,
    Typography,
    Chip,
    TextField
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import "./style.sass";

export const RatioCollectionPicker: FunctionComponent<{ ratioCollections: any }> = ({ ratioCollections }) => {
    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();

    // console.log({
    //     allSearchParams
    // });

    const options: { value: string, title: string, type: string }[] = ratioCollections?.map((c: any) => ({
        value: c.id,
        title: c.name,
        type: c.isOwnedByPlatform ? 'system' : c.isOwnedByUser ? 'user' : 'other\'s'
    }));

    const pickedChosenCollections = options ? (
        ids => ids?.map(
            (n: any) => options.find((c: any) => c.value === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.ratioCollections?.split('-').map(c => c.split('.')[1])) : [];

    // console.log({
    //     pickedChosenCollections
    // });

    const handleCollectionToggle = (e: any, { v }: any) => {
        updateParams({
            search: getNewSearchParamsString({
                paramsToAdd: {
                    ratioCollections: v.reduce((p: any, c: any) => `${p ? p + '-' : ''}${c.title}.${c.value}`, '')
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
                    getOptionLabel={option => option.title}
                    value={pickedChosenCollections}
                    // inputValue={v}
                    // onInputChange={(_, newInputValue) => {
                    //     console.log({
                    //         newInputValue
                    //     });
                    // }}
                    // defaultValue={v}
                    groupBy={option => `${option.type}`}
                    // forcePopupIcon={false}
                    onChange={(event, newInputValue) => {
                        handleCollectionToggle(event, { v: newInputValue });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={`Selected Collections`}
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