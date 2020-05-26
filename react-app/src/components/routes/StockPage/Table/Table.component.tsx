import React from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { useParams, Link as Link_ } from "react-router-dom";
import {
    Paper,
    Box,
    Typography,
    Link
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import NewCalcRowButton from '../NewCalcRowButton';

import "./style.sass";

const getQuartile = (v: number, quartiles: number[]) =>
    (v < quartiles[0]) ? 'q1' :
        (v < quartiles[1]) ? 'q2' :
            (v < quartiles[2]) ? 'q3' :
                'q4';

export default function Table(
    { years, data, title = '', allowNewCalc = true }:
        { years: number[], data: {}[], title?: string, allowNewCalc?: boolean }
) {

    const { ticker, rowTitle } = useParams();

    const columns = React.useMemo(() => [
        {
            id: 'expander',
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
                <></>
                // <span {...getToggleAllRowsExpandedProps()}>
                //     {isAllRowsExpanded ? 'expand none' : 'expand all'}
                // </span>
            ),
            Cell: ({ row, cell }: any) =>
                <span
                    {...row.getToggleRowExpandedProps({
                        style: {
                            paddingLeft: `${row.depth * 1}rem`,
                        },
                    })}
                    title=""
                // className={row.original.checkPossible ? 'relevant' : ''}
                >
                    {row.subRows.length ?
                        <span className="arrow"><ArrowDropDownIcon /></span> :
                        ''
                    }
                    {row.original.type === 'calc' ?
                        <Link component={Link_} color="inherit" to={`/stock/${ticker}/calculations/${title}/${cell.value}`}>
                            {cell.value}
                        </Link> :
                        cell.value
                    }
                    <span
                        title={`quartiles of change`}
                        className="quartiles"
                    >
                        {row.original.changePercentage?.quartiles.map((q: any, i: number) => (
                            <span key={`q${i + 1}`} className={`quartile q${i + 1}`}>{q}%</span>
                        )).reverse()}
                    </span>
                    {/* 10% 20% 70% 90% */}
                    {/* {row.canExpand ? (row.isExpanded ? <ArrowDropUp /> : <ArrowDropDown />) : null} */}
                </span>,
            accessor: 'title',
            sticky: 'left',
            width: 170
        },
        ...years.map((y: number) => ({
            Header: y,
            accessor: `${y}`,
            width: 90
        }))
    ], []);


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

            {title && (
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
            )}

            <Paper elevation={3}>
                <Box bgcolor="grey.800">
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
                                                        ${
                                                        row.original.changePercentage && getQuartile(
                                                            Number(row.original.changePercentage[cell.column.id]),
                                                            row.original.changePercentage.quartiles
                                                        )
                                                        }
                                                    `}
                                                    title={
                                                        row.original.changePercentage &&
                                                        `${row.original.changePercentage[cell.column.id]}%`
                                                    }
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
                </Box>
            </Paper>

            {allowNewCalc && <NewCalcRowButton title={title} />}

        </Box>

    );
}
