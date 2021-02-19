import React, { useState } from "react";
import { useTable, useBlockLayout, useExpanded, Column } from "react-table";
import { useSticky } from 'react-table-sticky';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { useParams, Link as Link_, useLocation, useHistory } from "react-router-dom";
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
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
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
        // showPercentage,
        // toggleShowPercentage,
        showGraph,
        toggleShowGraph,
        isBiggerHACK
    }: {
        ticker?: string,
        years: number[],
        data: {}[],
        title?: string,
        allowNewCalc?: boolean,
        // showPercentage?: boolean,
        // toggleShowPercentage?: any,
        showGraph?: boolean,
        toggleShowGraph?: any,
        isBiggerHACK?: boolean
    }
) {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [companyList, setCompanyList] = React.useState({
        title: '',
        companies: []
    });
    const handleClick = (event: any, { title, companies }: { title: string, companies: any }) => {
        console.log({
            companies
        });
        setAnchorEl(event.currentTarget === anchorEl ? null : event.currentTarget);
        setCompanyList({
            title,
            companies
        });

    };
    const open = Boolean(anchorEl);
    const handleClickAway = (e: any) => {
        if (!Object.assign({}, e.target.dataset).clicker) {
            setAnchorEl(null);
            setCompanyList({
                title: '',
                companies: []
            });
        }
    }

    const location = useLocation();
    const history = useHistory();
    const { allSearchParams, getNewSearchParamsString } = useSearchParams();

    const { showPercentage } = allSearchParams;

    const toggleShowPercentage = () => history.push({
        pathname: location.pathname,
        search: getNewSearchParamsString({
            ...showPercentage && { keysToRemove: ['showPercentage'] },
            ...!showPercentage && { paramsToAdd: { showPercentage: true } }
        }),
    })

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
            width: 140
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
                                    // console.log({ row });

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
                                                        ${row?.subRows?.length ? 'relevant' : ''}
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
                                                                            {row?.subRows?.length ?
                                                                                <span className="arrow"><ArrowDropDown /></span> :
                                                                                ''
                                                                            }

                                                                            {row.original.type === 'calc' ?
                                                                                <Link
                                                                                    component={Link_}
                                                                                    color="inherit"
                                                                                    to={{
                                                                                        pathname: location.pathname,
                                                                                        search: getNewSearchParamsString({ paramsToAdd: { ratio: cell.value, ticker } })
                                                                                    }}
                                                                                >
                                                                                    {cell.value || ''}
                                                                                </Link> :
                                                                                cell.value
                                                                            }
                                                                        </span >)
                                                            }
                                                        </div>
                                                        {/* {row.original.aggregate && (
                                                            <div>
                                                                <small>{
                                                                    cell.column.id === 'expander' ?
                                                                        'industry > Internet Content & Information'
                                                                        : `${row.original.aggregate ? numeral(row.original.aggregate[i].avg.$numberDecimal).format('(0.00a)') : '-'}`
                                                                }</small>
                                                            </div>
                                                        )} */}
                                                        {row.original.aggregate && (
                                                            <div>
                                                                <small className="comparisson">{
                                                                    cell.column.id === 'expander' ?
                                                                        '[industry] Internet Content & Information' :
                                                                        row.original.aggregate[cell.column.id] ?
                                                                            <span
                                                                                data-clicker="true"
                                                                                onClick={e => handleClick(e, {
                                                                                    title: `industry > Internet Content & Information | ${row.cells[0].value} | ${cell.column.id}`,
                                                                                    companies: row.original.aggregate[cell.column.id].companies
                                                                                })}
                                                                                title="μ (average) | Σ (sum) | #/n (rank / number of companies)"
                                                                            >
                                                                                μ<span className="number">{numeral(row.original.aggregate[cell.column.id].avg?.$numberDecimal).format('(0a)')}</span>{' '}
                                                                                Σ<span className="number">{numeral(row.original.aggregate[cell.column.id].sum?.$numberDecimal).format('(0a)')}</span>{' '}
                                                                                #<span className="number">{row.original.aggregate[cell.column.id].rank}/{row.original.aggregate[cell.column.id].count}</span>
                                                                            </span> :
                                                                            '-'
                                                                }</small>
                                                            </div>
                                                        )}
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
                            <Box paddingX={2} pt={2}>
                                <Typography variant="h5">
                                    {companyList.title}
                                </Typography>
                            </Box>
                            <MenuList>
                                {companyList.companies.map((c: any, i: number) =>
                                    <Link
                                        component={Link_}
                                        color="inherit"
                                        key={c.code + " " + i}
                                        to={`/stock/${c.code}`}
                                        target="_blank"
                                    >
                                        <MenuItem key={i}>
                                            <Box display="flex" justifyContent="space-between" width="100%">
                                                <span>{c.company}</span>
                                                <span>{numeral(c.v.$numberDecimal).format('(0.00a)')}</span>
                                            </Box>
                                        </MenuItem>
                                    </Link>
                                )}
                            </MenuList>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>


            {allowNewCalc && <NewCalcRowButton title={title} ticker={ticker} />}

        </Box>

    );
}
