import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import deepFind from 'deep-find';
import {
    Paper,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Fab,
    Chip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import TICKER_QUERY from '@state/graphql-queries/ticker';
import { doCalculations, scopeToRows, CalculationType } from '../calculations';

import Table from '../Table';

import "./style.sass";

export default function NewCalcRowModal() {

    const { ticker } = useParams();
    const { loading, error, data } = useQuery(TICKER_QUERY, {
        variables: { ticker },
    });

    const stock = data && data.getSimfinCompanyByTicker;

    const calcRowOptions = stock ? [
        { path: 'price', tableName: 'Price' },
        { path: 'shareClasses', tableName: 'Share Classes' },
        { path: 'aggregatedShares', tableName: 'Aggregated Shares' },
        { path: 'yearlyFinancials.bs', tableName: 'Balance Sheet' },
        { path: 'yearlyFinancials.cf', tableName: 'Cash Flow' },
        { path: 'yearlyFinancials.pl', tableName: 'Income Statement' }
    ].reduce((acc: any, table: any) => {
        return [
            ...acc,
            ...deepFind(stock, table.path).map((row: any) => ({
                value: `${table.path}[${row.title}]`,
                title: row.title,
                type: table.tableName
            }))
        ];
    }, []) : [];

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [titleValue, setTitleValue] = React.useState('');
    const [aboutValue, setAboutValue] = React.useState('');

    const [autocompleteValue, setAutocompleteValue] = React.useState([]);

    const handleOnChange = (e: any, v: any) => {
        setAutocompleteValue(v);
    }

    const options = [
        { value: '/', title: '/', type: 'Math' },
        { value: '*', title: '*', type: 'Math' },
        { value: '+', title: '+', type: 'Math' },
        { value: '-', title: '-', type: 'Math' },
        { value: '(', title: '(', type: 'Math' },
        { value: ")", title: ')', type: 'Math' },
        ...calcRowOptions
    ];

    // const calc = stock && doCalculations(calculations, stock.years, stock);

    const calc: CalculationType[] = [
        autocompleteValue.reduce((acc: any, curr: any, i: number) => {
            // console.log(curr.type);

            const letterIndex = (10 + Object.keys(acc.scope).length).toString(36)

            return ({
                scope: {
                    ...acc.scope,
                    ...(curr.type !== 'Math' ? { [letterIndex]: curr.value } : {})
                },
                calc: `${acc.calc}${(curr.type === 'Math' ? curr.value : letterIndex)}`
            })
        }, {
            scope: {},
            calc: '',
        })
    ];

    const calcRow = doCalculations(calc, stock.years, stock, titleValue);

    const scopeRows = scopeToRows(calc[0].scope, stock);

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                m={-1}
                mb={-3}
            >
                <Fab
                    size="small"
                    color="primary"
                    aria-label="add"
                    onClick={handleClickOpen}
                >
                    <AddIcon />
                </Fab>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <Box
                    minWidth={450}
                >
                    <DialogTitle>Calculation Builder <span title="just kidding, copy this all you want">™️</span></DialogTitle>
                    <DialogContent>

                        <Box display="flex" justifyContent="space-around">

                            <Box flex={1} mr={3}>
                                <TextField
                                    label="Name"
                                    fullWidth
                                    // size="small"
                                    // variant="outlined"
                                    value={titleValue}
                                    onChange={(event: any) => {
                                        setTitleValue(event.target.value);
                                    }}
                                />
                            </Box>

                            <Box flex={2} ml={3}>
                                <TextField
                                    label="About"
                                    fullWidth
                                    multiline
                                    // size="small"
                                    // variant="outlined"
                                    value={aboutValue}
                                    onChange={(event: any) => {
                                        setAboutValue(event.target.value);
                                    }}
                                />
                            </Box>

                        </Box>

                        <Box p={2}></Box>

                        <Autocomplete
                            multiple
                            autoComplete
                            autoHighlight
                            // autoSelect
                            options={options}
                            getOptionLabel={(option) => option.title}
                            value={autocompleteValue}
                            groupBy={(option) => `${option.type}`}
                            forcePopupIcon={false}
                            onChange={(event, newInputValue) => {
                                handleOnChange(event, newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Calculation"
                                    placeholder=""
                                />
                            )}
                            renderTags={(value: any[], getTagProps) =>
                                value.map((option: any, index: number) => {
                                    return (
                                        <Chip
                                            variant={option.type === 'Math' ? 'default' : 'outlined'}
                                            label={`
                                                        ${(option.type !== 'Math' && option.type !== 'Price') ? option.type + ' >' : ''}
                                                        ${option.title}
                                                    `}
                                            {...getTagProps({ index })}
                                            className={`${option.type}`}
                                            color={option.type === 'Math' ? 'primary' : 'default'}
                                            onDelete={undefined}
                                            onClick={(getTagProps({ index }) as any).onDelete}
                                        />
                                    )
                                })
                            }
                        />


                        <Box m={-2} mt={2}>
                            <Table
                                // title={'Income Statement'}
                                years={stock.years}
                                data={[
                                    ...Object.values(scopeRows),
                                    ...calcRow
                                ]}
                                allowNewCalc={false}
                            />
                        </Box>

                        {/* <Box p={2}></Box>

                        <pre>{JSON.stringify(scopeRows, null, 2)}</pre>

                        <Box p={2}></Box>

                        <pre>{JSON.stringify(calc, null, 2)}</pre>

                        <Box p={2}></Box> */}

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" autoFocus>
                            Add
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}
