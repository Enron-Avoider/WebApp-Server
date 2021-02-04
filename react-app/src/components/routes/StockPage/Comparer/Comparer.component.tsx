import React, { useState, FunctionComponent } from "react";

import PercentagePath from "@assets/icon-paths/percentage";
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    IconButton,
    ClickAwayListener,
    MenuList,
    Button,
    Card,
    CardContent,
    SvgIcon,
    Chip,
    TextField
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { FilterList, Equalizer } from '@material-ui/icons';

import "./style.sass";

export const Comparer: FunctionComponent<{
    stock: any
}> = ({
    stock
}) => {

        const [autocompleteValue, setAutocompleteValue] = React.useState([
            [{ value: stock.industry, title: stock.industry, type: 'Industry' }],
            [{ value: stock.sector, title: stock.sector, type: 'Sector' }]
        ]);

        const handleOnChange = (e: any, { v, i }: any) => {
            setAutocompleteValue([
                ...autocompleteValue.map((v_: any, i_: any) => i === i_ ? v : v_)
            ]);
        }

        const options = [
            { value: stock.industry, title: stock.industry, type: 'Industry' },
            { value: stock.sector, title: stock.sector, type: 'Sector' },
            { value: stock.exchange, title: stock.exchange, type: 'Exchange' },
            { value: stock.country, title: stock.country, type: 'Country' }
        ];

        console.log({ options, autocompleteValue });

        return (
            <>
                <Box display="flex" flexDirection="column" p={2}>
                    <Box pb={2}>
                        <Typography variant="h5">
                            Compare with:
                        </Typography>
                    </Box>
                    <Box flex="1">
                        {autocompleteValue.map((v, i) => (
                            <Box mb={2} key={i}>
                                <Autocomplete
                                    multiple
                                    autoComplete
                                    autoHighlight
                                    // autoSelect
                                    options={options}
                                    getOptionLabel={(option) => option.title}
                                    // value={v}
                                    // inputValue={v}
                                    // onInputChange={(_, newInputValue) => {
                                    //     console.log({
                                    //         newInputValue
                                    //     });
                                    // }}
                                    defaultValue={v}
                                    groupBy={(option) => `${option.type}`}
                                    forcePopupIcon={false}
                                    onChange={(event, newInputValue) => {
                                        handleOnChange(event, { v: newInputValue, i });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label={`Comparison ${i + 1}`}
                                            placeholder=""
                                        />
                                    )}
                                    renderTags={(value: any[], getTagProps) =>
                                        value.map((option: any, index: number) => {
                                            return (
                                                <Chip
                                                    label={`${option.type} > ${option.title}`}
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
                        ))}
                    </Box>
                    <Box pb={2}>
                        <Typography variant="h5">
                            By:
                        </Typography>
                    </Box>
                    <Box flex="1" display="flex">
                        <Box marginRight="10px">
                            <Chip clickable={true} label="Mean" />
                        </Box>
                        <Box marginRight="10px">
                            <Chip color="primary" clickable={true} label="Median" />
                        </Box>
                        <Box marginRight="10px">
                            <Chip clickable={true} label="Ranking" />
                        </Box>
                    </Box>
                </Box>
            </>
        );
    }
