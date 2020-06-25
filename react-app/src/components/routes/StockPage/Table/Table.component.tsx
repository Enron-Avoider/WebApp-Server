import React, { useState } from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { useParams, Link as Link_, useLocation } from "react-router-dom";
import numeral from 'numeral';
import {
    Paper,
    Box,
    Typography,
    Link,
    IconButton,
    Card,
    CardActions,
    CardContent,
    Button,
    ClickAwayListener,
    SvgIcon
} from '@material-ui/core';
import { ArrowDropDown, Equalizer } from '@material-ui/icons';
const math = require("mathjs");

import NewCalcRowButton from '../NewCalcRowButton';
import GraphCard from './GraphCard';

import "./style.sass";

const getQuartile = (v: number, quartiles: number[]) =>
    (v < quartiles[0]) ? 'q1' :
        (v < quartiles[1]) ? 'q2' :
            (v < quartiles[2]) ? 'q3' :
                'q4';

export default function Table(
    {
        ticker,
        years,
        data,
        title = '',
        allowNewCalc = false,
        showPercentage,
        toggleShowPercentage,
        showGraph,
        toggleShowGraph,
        isBiggerHACK
    }: {
        ticker: string,
        years: number[],
        data: {}[],
        title?: string,
        allowNewCalc?: boolean,
        showPercentage?: boolean,
        toggleShowPercentage?: any,
        showGraph?: boolean,
        toggleShowGraph?: any,
        isBiggerHACK?: boolean
    }
) {

    const  location = useLocation();
    const dataWithPercentages = React.useMemo(
        () => data.map((row: any) => ({
            ...row,
            changePercentage: years.map((y: any, i: number) => (
                (i === 0 || !row[y] || !row[y - 1])
                    ? 0
                    : ((row[y] - row[y - 1]) / Math.abs(row[y - 1])) * 100
            )).reduce(
                (acc, value, i, array) => ({
                    ...(i === 0
                        ? {
                            max: Math.max(...array.filter((v, i) => i > 0)).toFixed(0),
                            min: Math.min(...array.filter((v, i) => i > 0)).toFixed(0),
                            quartiles: math
                                .quantileSeq(array, [1 / 4, 1 / 2, 3 / 4, 1])
                                .map((x: any) => x.toFixed(1)),
                        }
                        : {}),
                    ...acc,
                    [`${years[i]}`]: value.toFixed(0),
                }),
                {}
            )
        })),
        [data]
    );

    // const { ticker, rowTitle } = useParams();

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
                        <span className="arrow"><ArrowDropDown /></span> :
                        ''
                    }
                    {row.original.type === 'calc' ?
                        <Link
                            component={Link_}
                            color="inherit"
                            to={{
                                pathname: location.pathname,
                                search: `?ratio=${cell.value}&ticker=${ticker}`
                                //${title}/${cell.value}
                            }}
                        >
                            {cell.value || ''}
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
            data: dataWithPercentages,
        },
        useBlockLayout,
        useExpanded,
        useSticky,
    );

    return (

        <Box p={2} mt={2} position="relative">

            {title && (
                <Box position="relative" mt={-1} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">
                        {title}
                    </Typography>

                    <Box>
                        <IconButton color={showPercentage ? 'secondary' : 'primary'} onClick={toggleShowPercentage}>
                            <SvgIcon viewBox="0 0 344 344">
                                <path
                                    d="M 99.00,57.23
                                        C 81.98,61.14 68.86,69.77 61.32,86.00
                                            46.16,118.63 69.68,157.58 106.00,158.00
                                            114.15,158.09 122.63,156.87 130.00,153.19
                                            168.76,133.86 166.91,77.59 128.00,60.88
                                            121.65,58.15 114.86,57.01 108.00,57.23
                                            104.64,57.00 102.36,57.00 99.00,57.23 Z
                                        M 231.00,63.00
                                        C 231.00,63.00 134.58,198.00 134.58,198.00
                                            134.58,198.00 103.86,241.00 103.86,241.00
                                            103.86,241.00 88.00,265.00 88.00,265.00
                                            88.00,265.00 113.00,281.00 113.00,281.00
                                            113.00,281.00 209.42,146.00 209.42,146.00
                                            209.42,146.00 240.14,103.00 240.14,103.00
                                            240.14,103.00 256.00,79.00 256.00,79.00
                                            256.00,79.00 231.00,63.00 231.00,63.00 Z
                                        M 108.00,86.71
                                        C 114.86,87.22 120.15,89.25 124.36,95.02
                                            133.88,108.01 125.02,127.21 109.00,128.24
                                            88.32,129.57 78.43,102.78 95.02,90.64
                                            99.23,87.55 102.94,86.86 108.00,86.71 Z
                                        M 228.00,186.23
                                        C 210.98,190.14 197.86,198.77 190.32,215.00
                                            175.16,247.63 198.68,286.58 235.00,287.00
                                            243.15,287.09 251.63,285.87 259.00,282.19
                                            297.76,262.86 295.91,206.59 257.00,189.88
                                            250.65,187.15 243.86,186.01 237.00,186.23
                                            233.64,186.00 231.36,186.00 228.00,186.23 Z
                                        M 237.00,215.71
                                        C 243.86,216.22 249.15,218.25 253.36,224.02
                                            262.88,237.01 254.02,256.21 238.00,257.24
                                            217.32,258.57 207.43,231.78 224.02,219.64
                                            228.23,216.55 231.94,215.86 237.00,215.71 Z"
                                />
                            </SvgIcon>
                        </IconButton>
                        <IconButton color={showGraph ? 'secondary' : 'primary'} onClick={toggleShowGraph}>
                            <Equalizer />
                        </IconButton>
                    </Box>
                </Box>
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
                                                        cell.column.id !== 'expander' && row.original.changePercentage ? (
                                                            showPercentage && row.original.changePercentage ?
                                                                cell.value : `${row.original?.changePercentage[cell?.column?.id]}%`
                                                        ) : ''
                                                    }
                                                >
                                                    {showPercentage && row.original.changePercentage && cell.column.id !== 'expander' ?
                                                        `${row.original.changePercentage[cell.column.id]}%` :
                                                        cell.column.id !== 'expander' ?
                                                            numeral(cell.value).format('(0.00a)') :
                                                            cell.render('Cell')
                                                    }
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

            {showGraph && (
                <Box
                    position="absolute"
                    top="56px"
                    width="calc(100% - 32px)"
                    height={`calc(100% - ${isBiggerHACK ? 72 : 81}px)`}
                    zIndex="1"
                    bgcolor="grey.800"
                >
                    <GraphCard
                        years={years}
                        data={dataWithPercentages}
                        showPercentage={showPercentage}
                    />
                </Box>
            )}

            {allowNewCalc && <NewCalcRowButton title={title} ticker={ticker} />}

        </Box>

    );
}
