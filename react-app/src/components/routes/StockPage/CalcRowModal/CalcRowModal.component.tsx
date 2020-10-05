import React, { useEffect } from "react";
import { useParams, Link, useRouteMatch, useHistory, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/react-hooks";
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

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import {
    GET_CALCULATIONS,
    ADD_CALCULATION,
    REMOVE_CALCULATION,
    SAVE_CALCULATION
} from '@state/byModel/Calculations/calculations.queries';
import { doCalculations, scopeToRows, CalculationType } from '../calculations';

import Table from '../Table';

import "./style.sass";

export default function NewCalcRowModal() {

    const location = useLocation();
    const { rowTitle, ticker } = (q => ({
        rowTitle: q.get('ratio') || '',
        ticker: q.get('ticker') || '',
    }))(new URLSearchParams(location.search));
    console.log({ rowTitle, ticker, location });
    // const { ticker, rowTitle, tableName } = useParams();
    const { loading, error, data } = useQuery(GET_STOCK, {
        variables: { ticker },
    });
    const { loading: loading_, error: error_, data: calculations } = useQuery(GET_CALCULATIONS, {
        variables: { ticker },
    });
    const [addCalculation] = useMutation(ADD_CALCULATION);
    const [removeCalculation] = useMutation(REMOVE_CALCULATION);
    const [saveCalculation] = useMutation(SAVE_CALCULATION);
    const [existing, setExistinging] = React.useState<Object>({});

    const isOpen = !!ticker;

    const stock = data && data.getSimfinCompanyByTicker;

    const calcRowOptions = stock ? [
        { path: 'yearlyFinancials.price', tableName: 'Price' },
        { path: 'yearlyFinancials.aggregatedShares', tableName: 'Aggregated Shares' },
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

    const history = useHistory();
    const handleClose = () => {
        history.push(location.pathname)
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

    // autocompleteValue to calc
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

    const handleAdd = async () => {
        await addCalculation({
            variables: {
                title: titleValue,
                about: aboutValue,
                onTable: 'hum',
                calc: calc[0].calc,
                scope: calc[0].scope
            }
        });
        handleClose();
    }

    const handleRemove = async () => {
        await removeCalculation({
            variables: {
                title: rowTitle,
            }
        });
        handleClose();
    }

    const handleSave = async () => {
        await saveCalculation({
            variables: {
                newTitle: titleValue,
                title: rowTitle,
                about: aboutValue,
                onTable: 'hum',
                calc: calc[0].calc,
                scope: calc[0].scope
            }
        });
        handleClose();
    }

    const calcRow =
        stock?.yearlyFinancials?.years ?
            doCalculations(calc, stock?.yearlyFinancials.years, stock, titleValue) :
            [];

    const scopeRows = scopeToRows(calc[0].scope, stock);

    useEffect(() => {
        const existing = calculations.calculations.find((c: any) => c.title === rowTitle);
        setExistinging(existing);
        if (existing) {
            setTitleValue(existing.title);
            setAboutValue(existing.about);
            const autocompleteValue = existing?.calc.split('').map((letter: string) => {
                if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(letter)) {
                    return options.find((op) => op.value === existing.scope[letter])
                } else {
                    return options.find((op) => op.value === letter)
                }
            });
            setAutocompleteValue(autocompleteValue);
        }
    }, [calculations, rowTitle]);

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <Box
                minWidth={450}
            >
                <DialogTitle>Ratio Builder <span title="just kidding, copy this all you want">™️</span></DialogTitle>
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
                            years={stock?.yearlyFinancials?.years}
                            data={[
                                ...Object.values(scopeRows),
                                ...calcRow
                            ]}
                            allowNewCalc={false}
                        />
                    </Box>

                    {/*

                    <Box p={2}></Box>

                    <pre>{JSON.stringify(autocompleteValue, null, 2)}</pre>

                    <Box p={2}></Box>

                    <pre>{JSON.stringify(calc, null, 2)}</pre>

                    <Box p={2}></Box> */}

                </DialogContent>
                <DialogActions>
                    {existing && (
                        <>
                            <Button onClick={handleRemove} color="primary">
                                Remove
                            </Button>

                            <Button onClick={handleSave} color="secondary">
                                Save
                            </Button>
                        </>
                    )}
                    {!existing && (
                        <Button onClick={handleAdd} color="secondary">
                            Add
                        </Button>
                    )}
                </DialogActions>
            </Box>
        </Dialog>
    );
}
