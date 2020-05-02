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
    Button,
    TextField
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import NewCalcRowModal from './NewCalcRowModal';

import { useBackgrounds } from '@components/shared/styles';

import "./style.sass";

export default function Table(
    { columns, data, title='', calculations=[] }:
    { columns: Column<{}>[], data: {}[], title: string, calculations?: any }
) {

    const { bg1 } = useBackgrounds();

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
            data: data,
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
                                            <div {...row.getRowProps()} className={`
                                                tr
                                                ${row.original.type === 'total' ? 'total' : ''}
                                            `}>
                                                {row.cells.map((cell: any) => (
                                                    <div
                                                        {...cell.getCellProps()}
                                                        className={`
                                                            td
                                                            ${row.subRows.length ? 'relevant' : ''}
                                                            ${row.original.type === 'calc' ? 'calc' : ''}
                                                        `}
                                                    >
                                                        {cell.render('Cell')}
                                                        {/* {row.original.type === 'calc' ? 'edit' : ''} */}
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
                <NewCalcRowModal />
            </div>

        </Box>

    );
}
