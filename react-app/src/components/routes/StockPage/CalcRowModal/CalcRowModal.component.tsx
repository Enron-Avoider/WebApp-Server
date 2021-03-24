import React, { useEffect } from "react";
import { useParams, Link, useRouteMatch, useHistory, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-apollo";
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
    GET_RATIO_COLLECTIONS,
    SAVE_RATIO_COLLECTION
} from '@state/byModel/Calculations/calculations.queries';
import { doCalculations, scopeToRows, CalculationType } from '@state/byModel/Calculations/calculations.map';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import getCalculations from '@state/byModel/Calculations/getCalculations.effect';
import { GET_USER_KEYS } from '@state/byModel/User/UserKey.localQueries';

import Table from '../Table';

import "./style.sass";

export default function NewCalcRowModal() {

    const { loading: UserKeysLoading, error: UserKeysError, data: UserKeysData } = useQuery(GET_USER_KEYS);
    const userKey = UserKeysData?.userKeys?.length && UserKeysData?.userKeys[0].id;

    const location = useLocation();
    const { allSearchParams, getNewSearchParamsString } = useSearchParams();
    const searchParams = allSearchParams;

    const { loading, error, data } = useQuery(GET_STOCK, {
        variables: { ticker: searchParams.ticker },
        skip: !searchParams.ticker
    });
    const stock = data && data.getStockByCode;

    const { ratioCollections } = getCalculations({ stock });

    const [chosenCollectionName, chosenCollectionId] = searchParams.ratioCollection?.split('.') || [];
    const chosenCollection = ratioCollections?.find((c: any) => c.id === chosenCollectionId);
    const existingCalc = chosenCollection?.calcs?.find((c: any) => c.title === searchParams.ratio);

    const [saveRatioCollection] = useMutation(SAVE_RATIO_COLLECTION);

    const isOpen = !!searchParams.ticker;

    const calcRowOptions = stock ? [
        { path: 'yearlyFinancials.price', tableName: 'Price' },
        { path: 'yearlyFinancials.aggregatedShares', tableName: 'Aggregated Shares' },
        { path: 'yearlyFinancials.bs', tableName: 'Balance Sheet' },
        { path: 'yearlyFinancials.cf', tableName: 'Cash Flow' },
        { path: 'yearlyFinancials.pl', tableName: 'Income Statement' },
        { path: 'yearlyFinancials.marketCap', tableName: 'Market Cap' }
    ].reduce((acc: any, table: any) => {
        return [
            ...acc,
            ...deepFind(stock, table.path).reduce((p: any, row: any) => [
                ...p,
                {
                    value: `${table.path}.${row.title}`.replace('yearlyFinancials.', ''),
                    title: row.title,
                    type: table.tableName
                },
                ...row?.subRows ?
                    row.subRows.reduce((p_: any, row_: any) => [
                        ...p_,
                        {
                            value: `${table.path}.${row.title}.subRows.${row_.title}`.replace('yearlyFinancials.', ''),
                            title: row.title + ' - ' + row_.title,
                            type: table.tableName
                        }
                    ], []) :
                    []
            ], [])
        ];
    }, []).filter(i => i.title) : [];

    const options = [
        { value: '/', title: '/', type: 'Math' },
        { value: '*', title: '*', type: 'Math' },
        { value: '+', title: '+', type: 'Math' },
        { value: '-', title: '-', type: 'Math' },
        { value: '(', title: '(', type: 'Math' },
        { value: ")", title: ')', type: 'Math' },
        ...calcRowOptions
    ];

    const history = useHistory();
    const handleClose = () => {
        setTitleValue('');
        setAboutValue('');
        setAutocompleteValue([]);
        history.push({
            pathname: location.pathname,
            search: getNewSearchParamsString({
                keysToRemove: ['ratio', 'ticker', 'ratioCollection']
            }),
        })
    };

    const [titleValue, setTitleValue] = React.useState('');
    const [aboutValue, setAboutValue] = React.useState('');
    const [autocompleteValue, setAutocompleteValue] = React.useState([]);

    console.log({
        // ratioCollections,
        // ratioCollection: searchParams.ratioCollection,
        // ratio: searchParams.ratio,
        // chosenCollectionName,
        // chosenCollectionId,
        // chosenCollection,
        existingCalc,
        autocompleteValue
    });


    const handleOnChange = (e: any, v: any) => {
        setAutocompleteValue(v);
    }

    // autocompleteValue to calc
    // console.log({ autocompleteValue });
    const calc: CalculationType[] = [
        autocompleteValue?.reduce((acc: any, curr: any, i: number) => {
            // console.log(curr.type);

            const letterIndex = (10 + Object.keys(acc.scope).length).toString(36)

            return ({
                scope: {
                    ...acc.scope,
                    ...(curr?.type !== 'Math' ? { [letterIndex]: curr?.value } : {})
                },
                calc: `${acc?.calc}${(curr?.type === 'Math' ? curr?.value : letterIndex)}`
            })
        }, {
            scope: {},
            calc: '',
        })
    ];

    const handleAdd = async () => {
        await saveRatioCollection({
            variables: {
                ratioCollection: {
                    ...chosenCollection,
                    calcs: [
                        ...chosenCollection.calcs,
                        {
                            calc: calc[0].calc,
                            title: titleValue,
                            about: aboutValue,
                            scope: calc[0].scope
                        }
                    ]
                },
                userId: userKey
            }
        });
        handleClose();
    }

    const handleRemove = async () => {
        await saveRatioCollection({
            variables: {
                ratioCollection: {
                    ...chosenCollection,
                    calcs: chosenCollection.calcs
                        .filter((c: any) => c.title !== existingCalc.title)
                },
                userId: userKey
            }
        });
        handleClose();
    }

    const handleSave = async () => {
        await saveRatioCollection({
            variables: {
                ratioCollection: {
                    ...chosenCollection,
                    calcs: chosenCollection.calcs.map((c: any) => {
                        if (c.title === existingCalc.title) {
                            return {
                                ...c,
                                calc: calc[0].calc,
                                title: titleValue,
                                about: aboutValue,
                                scope: calc[0].scope
                            }
                        } else {
                            return c;
                        }
                    })
                },
                userId: userKey
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
        if (existingCalc) {
            setTitleValue(existingCalc.title);
            setAboutValue(existingCalc.about);
            const autocompleteValue = existingCalc?.calc.split('').map((letter: string) => {
                if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(letter)) {
                    return options.find((op) => op.value === existingCalc.scope[letter])
                } else {
                    return options.find((op) => op.value === letter)
                }
            });
            setAutocompleteValue(autocompleteValue);
        }
    }, [searchParams.ratio]);

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <Box
                minWidth={455}
            >
                <DialogTitle>
                    {!existingCalc ?
                        `New Ratio on ${chosenCollectionName}` :
                        `${existingCalc.title} on ${chosenCollectionName}`
                    }
                </DialogTitle>
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
                                InputProps={{
                                    readOnly: !chosenCollection?.isOwnedByUser,
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
                                InputProps={{
                                    readOnly: !chosenCollection?.isOwnedByUser,
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
                            // InputProps={{
                            //     readOnly: !chosenCollection?.isOwnedByUser,
                            // }}
                            />
                        )}
                        renderTags={(value: any[], getTagProps) =>
                            value.map((option: any, index: number) => {
                                return (
                                    <Chip
                                        variant={option?.type === 'Math' ? 'default' : 'outlined'}
                                        label={`
                                                    ${(option?.type !== 'Math' && option?.type !== 'Price') ? option?.type + ' >' : ''}
                                                    ${option?.title}
                                                `}
                                        {...getTagProps({ index })}
                                        className={`${option?.type}`}
                                        color={option?.type === 'Math' ? 'primary' : 'default'}
                                        onDelete={undefined}
                                        onClick={(getTagProps({ index }) as any).onDelete}
                                    />
                                )
                            })
                        }
                    />


                    {stock && (
                        <Box m={-2} mt={2}>
                            {/* <pre>{JSON.stringify(scopeRows, null, 2)}</pre> */}
                            <Table
                                years={stock?.yearlyFinancials?.years}
                                data={[
                                    ...Object.values(scopeRows),
                                    ...calcRow
                                ]}
                            />
                        </Box>

                    )}

                    {/* <pre>{JSON.stringify(Object.values(scopeRows), null, 2)}</pre>
                    <pre>{JSON.stringify(calcRow, null, 2)}</pre> */}

                    {/*

                    <Box p={2}></Box>

                    <pre>{JSON.stringify(autocompleteValue, null, 2)}</pre>

                    <Box p={2}></Box>

                    <pre>{JSON.stringify(calc, null, 2)}</pre>

                    <Box p={2}></Box> */}

                </DialogContent>

                {chosenCollection?.isOwnedByUser && (
                    <DialogActions>
                        {existingCalc && (
                            <>
                                <Button onClick={handleRemove} color="primary">
                                    Remove
                                </Button>

                                <Button onClick={handleSave} color="secondary">
                                    Save
                                </Button>
                            </>
                        )}
                        {!existingCalc && (
                            <Button onClick={handleAdd} color="secondary">
                                Add
                            </Button>
                        )}
                    </DialogActions>
                )}
            </Box>
        </Dialog>
    );
}
