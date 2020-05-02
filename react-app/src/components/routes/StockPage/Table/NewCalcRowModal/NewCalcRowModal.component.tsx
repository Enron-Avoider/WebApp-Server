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
        setInputValue(v.map((v: any) => v.replace('_','')));
    }

    const top100Films = [
        { title: 'The Shawshank Redemption_', year: 1994 },
        { title: 'The Godfather_', year: 1972 },
        { title: 'Forrest Gump_', year: 1994 },
        { title: 'Inception_', year: 2010 },
        { title: 'The Lord of the Rings: The Two Towers_', year: 2002 },
        { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
        { title: 'Goodfellas_', year: 1990 },
        { title: 'The Matrix_', year: 1999 },
        { title: 'Seven Samurai_', year: 1954 },
        { title: 'Star Wars: Episode IV - A New Hope_', year: 1977 },
        { title: 'City of God_', year: 2002 },
        { title: 'Se7en_', year: 1995 },
        { title: 'The Silence of the Lambs_', year: 1991 },
        { title: "It's a Wonderful Life", year: 1946 },
        { title: 'Life Is Beautiful_', year: 1997 },
        { title: 'The Usual Suspects_', year: 1995 },
        { title: 'Léon: The Professional_', year: 1994 },
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
                    <DialogContentText>
                        Let Google help apps determine location. This means sending
                        anonymous location data to Google, even when no apps are running.
                    </DialogContentText>
                    {/* <TextField
                        id="outlined-multiline-static"
                        label="Multiline"
                        multiline
                        fullWidth
                        rows={4}
                        defaultValue="Default Value"
                        variant="outlined"
                    /> */}
                    <Autocomplete
                        multiple
                        options={top100Films.map((option) => option.title)}
                        // getOptionLabel={(option) => option.title}
                        value={inputValue}
                        // defaultValue={[top100Films[1].title, 'teeeest']}
                        // filterSelectedOptions
                        // onChange={handleOnChange}
                        forcePopupIcon={false}
                        onChange={(event, newInputValue) => {
                            handleOnChange(event, newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="filterSelectedOptions"
                                placeholder="Favorites"
                            />
                        )}
                        renderTags={(value: string[], getTagProps) =>
                            value.map((option: string, index: number) => {
                                console.log({ ...getTagProps({ index }) })
                                return (
                                    <Chip
                                        variant="outlined"
                                        // deleteIcon={false}
                                        label={option}
                                        {...getTagProps({ index })}
                                        onDelete={false}
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
