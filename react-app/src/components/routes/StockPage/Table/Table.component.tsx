import React from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';

import "./style.sass";

export default function Table({ columns, data }: { columns: Column<{}>[], data: {}[] }) {

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

    console.log({ rows });

    return (
        <div className={'TableContainer'}>
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
                                        <div {...cell.getCellProps()} className="td">
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
    );
}
