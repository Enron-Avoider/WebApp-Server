import React from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Paper } from '@material-ui/core';

import { useBackgrounds } from '@components/shared/styles';

import "./style.sass";

export default function Table({ columns, data }: { columns: Column<{}>[], data: {}[] }) {

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
            data,
        },
        useBlockLayout,
        useExpanded,
        useSticky,
    );

    return (
        <Paper elevation={3}>
            <div className={`TableContainer ${bg1}`}>
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
                                                className="td"
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
    );
}
