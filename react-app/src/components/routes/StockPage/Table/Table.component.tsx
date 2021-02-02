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
    SvgIcon,
    Popper,
    MenuList,
    MenuItem,
} from '@material-ui/core';
import { ArrowDropDown, Equalizer } from '@material-ui/icons';
const math = require("mathjs");

import PercentagePath from "@assets/icon-paths/percentage";

import NewCalcRowButton from '../NewCalcRowButton';
import GraphCard from './GraphCard';

import "./style.sass";

const getRowPercentages = (row: any, years: any) =>
    years.map((y: any, i: number) => (
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
    );

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
        ticker?: string,
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

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [companyList, setCompanyList] = React.useState([]);
    const handleClick = (event: any, companies: any) => {
        console.log({
            t: event.currentTarget
        });
        setAnchorEl(event.currentTarget === anchorEl ? null : event.currentTarget);
        setCompanyList(companies);

    };
    const open = Boolean(anchorEl);
    const handleClickAway = (e: any) => {
        if (!Object.assign({}, e.target.dataset).clicker) {
            setAnchorEl(null);
            setCompanyList([]);
        }
    }

    const location = useLocation();

    const columns = React.useMemo(() => [
        {
            id: 'expander',
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
            data
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
                                <path d={PercentagePath} />
                            </SvgIcon>
                        </IconButton>
                        {/* <IconButton color={showGraph ? 'secondary' : 'primary'} onClick={toggleShowGraph}>
                            <Equalizer />
                        </IconButton> */}
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

                                    const changePercentage: any = getRowPercentages(row.original, years);
                                    console.log({ row });

                                    return (
                                        <div {...row.getRowProps()} className={`
                                            tr
                                            ${row.original.type === 'total' ? 'total' : ''}
                                        `}>
                                            {row.cells.map((cell: any, i: number) => (
                                                <div
                                                    {...cell.getCellProps()}
                                                    className={`
                                                        td
                                                        ${row.subRows.length ? 'relevant' : ''}
                                                    `}
                                                // title={
                                                //     cell.column.id !== 'expander' && changePercentage ? (
                                                //         showPercentage && changePercentage ?
                                                //             cell.value : `${changePercentage[cell?.column?.id]}%`
                                                //     ) : ''
                                                // }
                                                >
                                                    <div className={`
                                                        ${cell.column.id === 'expander' && `pl-${row.depth}`}
                                                    `}>
                                                        <div className={`
                                                            ${cell.column.id === 'expander' ?
                                                                `${row.original.type === 'calc' ? 'calc' : ''}` :
                                                                `
                                                                    quartile ${changePercentage &&
                                                                getQuartile(Number(changePercentage[cell.column.id]), changePercentage.quartiles)
                                                                }
                                                                `
                                                            }
                                                        `}>
                                                            {showPercentage && changePercentage && cell.column.id !== 'expander' ?
                                                                `${changePercentage[cell.column.id]}%` :
                                                                cell.column.id !== 'expander' ?
                                                                    numeral(cell.value).format('(0.00a)') :
                                                                    (
                                                                        <span
                                                                            {...row.getToggleRowExpandedProps()}
                                                                            title=""
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
                                                                        </span >)
                                                            }
                                                        </div>
                                                        <div>
                                                            <small>{
                                                                cell.column.id === 'expander' ?
                                                                    'industry > Internet Content & Information'
                                                                    : `${cell.column.id} - ${i}`
                                                            }</small>
                                                        </div>
                                                        <div>
                                                            <small>{
                                                                cell.column.id === 'expander' ? 'Title' :
                                                                    row.original.aggregate && row.original.aggregate[i] &&
                                                                    <span data-clicker="true" onClick={e => handleClick(e, row.original.aggregate[i].companies)}>
                                                                        {/* {numeral(row.original.aggregate[i].avg?.$numberDecimal).format('(0.00a)')} */}
                                                                        🙏
                                                                    </span>
                                                            }</small>
                                                        </div>
                                                    </div>
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

            <Popper open={open} anchorEl={anchorEl} style={{ zIndex: 1 }}>
                <ClickAwayListener onClickAway={handleClickAway}>
                    <Paper>
                        <Box overflow="auto" height="300px">
                            <MenuList>
                                {companyList.map((c: any) =>
                                    <MenuItem>
                                        <Box display="flex" justifyContent="space-between" width="100%">
                                            <span>{c.company}</span>
                                            <span>{numeral(c.v.$numberDecimal).format('(0.00a)')}</span>
                                        </Box>
                                    </MenuItem>
                                )}
                            </MenuList>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            {/* {showGraph && (
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
                        data={data}
                        showPercentage={showPercentage}
                    />
                </Box>
            )} */}

            {allowNewCalc && <NewCalcRowButton title={title} ticker={ticker} />}

        </Box>

    );
}
