import React, { FunctionComponent } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    Link,
} from '@material-ui/core';
import { Link as Link_ } from "react-router-dom";
import { useQuery } from "react-apollo";
import numeral from 'numeral';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { useTable, useBlockLayout } from 'react-table';
import { FixedSizeList } from 'react-window';

import { GET_AGGREGATE_FOR_CALC_ROW, GET_AGGREGATE_FOR_FINANCIAL_ROW } from '@state/byModel/Aggregate/aggregate.queries';
import './style.sass';
import scrollbarWidth from './scrollbarWidth';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';


function Table({ columns, data }: any) {
    // Use the state and functions returned from useTable to build your UI

    const defaultColumn = React.useMemo(
        () => ({
            width: 150,
        }),
        []
    )

    const scrollBarSize = React.useMemo(() => scrollbarWidth(), [])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        totalColumnsWidth,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
        },
        useBlockLayout
    )

    const RenderRow = React.useCallback(
        ({ index, style }) => {
            const row = rows[index]
            prepareRow(row)
            return (
                <div
                    {...row.getRowProps({
                        style,
                    })}
                    className="tr"
                >
                    {row.cells.map(cell => {
                        return (
                            <div {...cell.getCellProps()} className="td">
                                {cell.render('Cell')}
                            </div>
                        )
                    })}
                </div>
            )
        },
        [prepareRow, rows]
    )

    // Render the UI for your table
    return (
        <div {...getTableProps()} className="table">
            <div>
                {headerGroups.map(headerGroup => (
                    <div {...headerGroup.getHeaderGroupProps()} className="tr">
                        {headerGroup.headers.map(column => (
                            <div {...column.getHeaderProps()} className="th">
                                {column.render('Header')}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div {...getTableBodyProps()}>
                <FixedSizeList
                    height={400}
                    itemCount={rows.length}
                    itemSize={35}
                    width={totalColumnsWidth + scrollBarSize}
                >
                    {RenderRow}
                </FixedSizeList>
            </div>
        </div>
    )
}




export const RankingItem: FunctionComponent<{
    comparison: any,
    row: string,
    collectionId?: string,
    stock: any,
    ticker?: string,
}> = ({
    comparison,
    row,
    collectionId,
    stock,
    ticker
}) => {
        const { getNewSearchParamsString } = useSearchParams();

        const {
            loading: loading_aggregatesForFinancialRows,
            error: error_aggregatesForFinancialRows,
            data: aggregateRes
        } = useQuery(collectionId ? GET_AGGREGATE_FOR_CALC_ROW : GET_AGGREGATE_FOR_FINANCIAL_ROW, {
            variables: {
                query: {
                    ...((v: any) => v ? ({
                        [
                            v[0] === 'Stock_Related' && stock ?
                                v[1].replaceAll("_", " ") :
                                v[0]
                        ]: v[0] === 'Stock_Related' && stock ? stock[v[1]] : v[1]?.replaceAll("_", " ")

                    }) : {})(comparison?.value.split('__'))
                },
                companiesForRow: row,
                ...collectionId ? { collectionId } : {}
            },
            skip: (!comparison || !!ticker && !stock)
        });

        const aggregationsPerYear = aggregateRes && (
            collectionId ?
                aggregateRes?.getAggregateForCalcRows?.calcRows[`calc_${row}`] : 
                aggregateRes?.getAggregateForFinancialRows?.financialRows[row.replace('.', '_')]
            )
            //[row.replace('.', '_')];

        const maxCompanyYearlyLength = aggregationsPerYear ?
            aggregationsPerYear.reduce((p: number, c: any) => c.companies.length > p ? c.companies.length : p, 0) :
            [];

        const rankTable = [...Array(maxCompanyYearlyLength)].map((r, i) => ({
            ...aggregationsPerYear ? aggregationsPerYear.reduce((p: any, y: any) => ({
                ...p,
                [y._id.year]: y.companies[i] ?
                    (<>
                        <Link
                            component={Link_}
                            color="inherit"
                            to={
                                {
                                    pathname: `/stock/${y.companies[i]?.code}`,
                                    search: (getNewSearchParamsString({ keysToRemove: ['ticker'] }) as string)
                                }
                            }
                            target="_blank"
                        >{y.companies[i]?.company}</Link>:{' '}
                        {numeral(y.companies[i]?.v.$numberDecimal).format('(0.00a)')}
                    </>) :
                    null
            }), {}) : {}
        }));

        console.log({
            ticker,
            stock,
            aggregateRes,
            aggregationsPerYear
            // row,
            // comparison,
            // aggregationsPerYear,
            // agg: aggregateRes?.getAggregateForFinancialRows?.financialRows[row.replace('.', '_')],
            // maxCompanyYearlyLength,
            // rankTable
        });

        const columns = React.useMemo(
            () => [
                {
                    Header: 'Rank #',
                    accessor: (row: any, i: number) => i,
                    width: 80
                },
                ...aggregationsPerYear ? aggregationsPerYear.map((y: any) => ({
                    Header: y._id.year,
                    accessor: y._id.year,
                    width: 420
                })) : []
            ],
            [loading_aggregatesForFinancialRows]
        )

        const data = React.useMemo(
            () => rankTable,
            [loading_aggregatesForFinancialRows]
        );

        return (
            <Paper>
                <Box p={2} mt={2}>
                    <Box>
                        <Box mb={1}>
                            <Typography variant="h5">

                                {comparison?.type}: {comparison?.title}
                                {' '}
                                {
                                    comparison?.type === 'Stock Related' && stock ?
                                        <small>{` (${stock.name} - ${stock[comparison?.value.split('__')[1]]})`}</small> :
                                        null
                                }
                            </Typography>
                        </Box>

                        {loading_aggregatesForFinancialRows ? (
                            <CircularProgress size={100} />
                        ) : (
                            <Paper elevation={3}>
                                <Box bgcolor="grey.800">
                                    <ScrollSyncPane>
                                        <div className="table-wrapper">
                                            <Table columns={columns} data={data} />
                                        </div>
                                    </ScrollSyncPane>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Paper>
        );
    }
