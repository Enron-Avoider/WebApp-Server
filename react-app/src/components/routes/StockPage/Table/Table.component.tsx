import React from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import {
    Paper,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';

import { useBackgrounds } from '@components/shared/styles';

import "./style.sass";

export default function Table(
    { columns, data, title='' }:
    { columns: Column<{}>[], data: {}[], title: string }
) {

    const { bg1 } = useBackgrounds();

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        // state: { expanded },
    } = useTable(
        {
            columns,
            data,
        },
        useBlockLayout,
        useExpanded,
        useSticky,
    );

    return (

        <Box p={2} mt={2}>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>

            <div className={`TableContainer`}>
                <Paper elevation={3}>
                    <div className={`${bg1}`}>
                        <ScrollSyncPane>
                            <div {...getTableProps()} className="table sticky">
                                <div className="header">
                                    {headerGroups.map((headerGroup: any) => (
                                        <div {...headerGroup.getHeaderGroupProps()} className="tr">
                                            {headerGroup.headers.map((column: any) => (
                                                <div {...column.getHeaderProps()} className="th">
                                                    {column.render('Header')}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <div {...getTableBodyProps()} className="body">
                                    {rows.map((row: any) => {
                                        prepareRow(row);
                                        return (
                                            <div {...row.getRowProps()} className="tr">
                                                {row.cells.map((cell: any) => (
                                                    <div
                                                        {...cell.getCellProps()}
                                                        className={`td ${row.subRows.length ? 'relevant' : ''}`}
                                                    >
                                                        {cell.render('Cell')}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </ScrollSyncPane>
                    </div>
                </Paper>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    m={-1}
                    mb={-3}
                >
                    <Fab size="small" color="primary" aria-label="add" onClick={handleClickOpen}>
                        <AddIcon />
                    </Fab>
                </Box>
                <Dialog
                    open={open}
                    onClose={handleClose}
                >
                    <DialogTitle>Add a new Ratio to TABLENAME</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Let Google help apps determine location. This means sending anonymous location data to
                            Google, even when no apps are running.
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" autoFocus>
                            Add
                    </Button>
                    </DialogActions>
                </Dialog>
            </div>

        </Box>

    );
}
