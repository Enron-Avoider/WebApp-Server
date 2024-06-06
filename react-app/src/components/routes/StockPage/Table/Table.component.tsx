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
    SvgIcon,
    Popper,
    MenuList,
    MenuItem,
    TextField,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowDropDown, Equalizer, ZoomOutMap } from '@mui/icons-material';
const math = require("mathjs");

import PercentagePath from "@assets/icon-paths/percentage";
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import getComparisonOptions from '@state/byModel/ComparisonOptions/ComparisonOptions.effect';

import "./style.sass";

const getRowPercentages = (row: any, years: any) =>
    [...years]
        .map((y: any, i: number) =>
        (
            (!row[y] || !row[y - 1])
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
        isCollectionOwner,
        onTitleEdit,
        collectionName,
        loading
    }: {
        ticker?: string,
        years: number[],
        data: {}[],
        title?: string,
        isCollectionOwner?: boolean,
        onTitleEdit?: Function,
        collectionName?: String,
        loading?: boolean,
    }
) {

    // console.log({ data });

    const location = useLocation();
    const history = useHistory();
    const { allSearchParams, getNewSearchParamsString } = useSearchParams();

    const { getComparisonOption } = getComparisonOptions();

    const { showPercentage } = allSearchParams;

    const pickedComparisons = allSearchParams.comparisons?.split('-')
        .filter((c: any) => typeof c !== 'undefined')

    const toggleShowPercentage = () => history.push({
        pathname: location.pathname,
        search: getNewSearchParamsString({
            ...showPercentage && { keysToRemove: ['showPercentage'] },
            ...!showPercentage && { paramsToAdd: { showPercentage: true } }
        })
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
            width: 180
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
                    {/* {onTitleEdit && false ? (
                        <TextField
                            // label="Name"
                            // fullWidth
                            // size="small"
                            // variant="outlined"
                            value={title}
                            onChange={(event: any) => {
                                onTitleEdit(event?.target?.value);
                            }}
                        />
                    ) : ( */}
                    <Box display="flex">
                        <Typography variant="h6">
                            {title}

                        </Typography>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            ml={3}
                        >
                            {loading && <CircularProgress />}
                        </Box>
                    </Box>
                    {/* )} */}

                    <Box>
                        <IconButton color={showPercentage ? 'secondary' : 'primary'} onClick={toggleShowPercentage}>
                            <SvgIcon viewBox="0 0 344 344">
                                <path d={PercentagePath} />
                            </SvgIcon>
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

                                    const changePercentage: any = getRowPercentages(row.original, years);

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
                                                                    <span title={numeral(cell.value).format('0,0[.]00')}>{cell.value === null ? '-' : numeral(cell.value).format('(0.00a)')}</span> :
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
                                                                                        search: getNewSearchParamsString({
                                                                                            paramsToAdd: {
                                                                                                ratio: cell.value,
                                                                                                ticker,
                                                                                                ratioCollection: collectionName
                                                                                            }
                                                                                        })
                                                                                    }}
                                                                                >
                                                                                    {cell.value || ''}
                                                                                </Link> :
                                                                                cell.value
                                                                            }

                                                                            {row.original.key && (
                                                                                <Box display="inline" position="relative" top={3} left={1}>
                                                                                    <Link
                                                                                        component={Link_}
                                                                                        color="inherit"
                                                                                        to={{
                                                                                            pathname: `/ranking/${row.original.key}`,
                                                                                            search: getNewSearchParamsString({
                                                                                                paramsToAdd: { ticker }
                                                                                            })
                                                                                        }}
                                                                                        target="_blank"
                                                                                    >
                                                                                        <ZoomOutMap fontSize="inherit" />
                                                                                    </Link>
                                                                                </Box>
                                                                            )}

                                                                        </span >)
                                                            }
                                                        </div>
                                                        {pickedComparisons?.map(c => row.original[c] && (
                                                            <div key={c}>
                                                                <small className="comparisson">{
                                                                    cell.column.id === 'expander' ?
                                                                        getComparisonOption(c) :
                                                                        (row.original[c][cell.column.id] ?
                                                                            <span
                                                                                key={`${c}-${cell.column.id}-${row.cells[0].value}`}
                                                                                title="average ・ sum ・ rank / number of companies"
                                                                            >
                                                                                <span className="number">{numeral(row.original[c][cell.column.id].avg?.$numberDecimal).format('(0a)')}</span>{'・'}
                                                                                <span className="number">{numeral(row.original[c][cell.column.id].sum?.$numberDecimal).format('(0a)')}</span>{'・'}
                                                                                <span className="number">
                                                                                    TODO
                                                                                    {
                                                                                        //row.original[c][cell.column.id].rank}/{row.original[c][cell.column.id].count
                                                                                    }
                                                                                </span>
                                                                            </span> : '-'
                                                                        )
                                                                }</small>
                                                            </div>
                                                        ))}
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
        </Box>

    );
}
