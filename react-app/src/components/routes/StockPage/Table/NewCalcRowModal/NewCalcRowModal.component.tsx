import React from "react";
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


import "./style.sass";

export default function NewCalcRowModal() {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [inputValue, setInputValue] = React.useState([]);

    const handleOnChange = (e: any, v: any) => {
        console.log({
            e, v
        });
        setInputValue(v);

        // TODO: filter options based on last (eg: if row only allow  math)
        // setInputValue(v.map((v: any) => v.value ? v.value.replace('_','') : v));
    }

    const options = [
        { value: 'yearlyFinancials.pl[Net Income Available to Common Shareholders]', title: 'Net Income Available to Common Shareholders', type: 'Income Statement' },
        { value: 'aggregatedShares[common-outstanding-basic]', title: 'Common Outstanding Basic', type: 'Shares' },

        { value: '/', title: '/', type: 'Math' },
        { value: '*', title: '*', type: 'Math' },
        { value: '+', title: '+', type: 'Math' },
        { value: '-', title: '-', type: 'Math' },
        { value: '(', title: '(', type: 'Math' },
        { value: ")", title: ')', type: 'Math' },
    ];

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
                <DialogTitle>Add a new Ratio to TABLENAME</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        autoComplete
                        autoHighlight
                        autoSelect
                        options={options}
                        getOptionLabel={(option) => option.title}
                        value={inputValue}
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
                                console.log({ ...getTagProps({ index }) })
                                return (
                                    <Chip
                                        variant="outlined"
                                        label={option.title}
                                        {...getTagProps({ index })}
                                        onDelete={undefined}
                                    />
                                )
                            })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
