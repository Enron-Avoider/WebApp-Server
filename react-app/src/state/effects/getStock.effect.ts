import { useState, useEffect } from 'react';
import { useQuery } from "react-apollo";

import { GET_STOCK } from '@state/byModel/Stocks/stocks.queries';
import { GET_AGGREGATE_FOR_STOCK } from '@state/byModel/Aggregate/aggregate.queries';

export default function getStock({ ticker }: { ticker: string }) {

    const [res, setRes] = useState<{
        stock?: any,
        aggregate_for_stock?: any,
        mergedStockAndAggregateYearlyFinancials?: any,
    }>({});

    const { loading, error, data: stockRes } = useQuery(GET_STOCK, {
        variables: { ticker },
    });

    const { loading: loading__, error: error__, data: aggregate_for_stock } = !loading && !error ? useQuery(GET_AGGREGATE_FOR_STOCK, {
        variables: {
            // sector: stock.sector,
            industry: stock.industry,
            // country: stock.country,
            // exchange: stock.exchange,
            // calcs: stock.sector,
        },
    }) : {};


    if (stockRes?.getStockByCode?.code !== res.stock?.code) {
        setRes({
            ...res,
            stock: stockRes.getStockByCode
        })
    }

    useEffect(() => {
        const getAsyncThings = async () => {

            // const stock = data && data.getStockByCode;

            // console.log({ stock });

            // const { loading: loading__, error: error__, data: aggregate_for_stock } = !loading && !error ? useQuery(GET_AGGREGATE_FOR_STOCK, {
            //     variables: {
            //         // sector: stock.sector,
            //         industry: stock.industry,
            //         // country: stock.country,
            //         // exchange: stock.exchange,
            //         // calcs: stock.sector,
            //     },
            // }) : {};

            // console.log({ aggregate_for_stock });

            // const mergedStockAndAggregateYearlyFinancials = stock && aggregate_for_stock && (Object.entries(stock.yearlyFinancials) as any)
            //     .filter(([key, value]: any) => !!value && key !== '__typename')
            //     .reduce(
            //         (p: any, [k, v]: any) => ({
            //             ...p,
            //             [k]: (k === "years") ? v : v.map((v_: any) => ({
            //                 ...v_,
            //                 aggregate: aggregate_for_stock.getAggregateForStock.defaultRows[`${k}_${v_.title}`],
            //                 ...v_.subRows ? v_.subRows.map((v__: any) => ({
            //                     ...v__,
            //                     aggregate: aggregate_for_stock.getAggregateForStock.defaultRows[`${k}_${v_.title}_${v__.title}`],
            //                 })) : []
            //             }))
            //         }),
            //         {}
            //     );

            // setRes({
            //     stock,
            //     aggregate_for_stock
            // });

            // console.log({ mergedStockAndAggregateYearlyFinancials });

        }
        getAsyncThings();
    }, []);

    return {
        ...res
    }
}