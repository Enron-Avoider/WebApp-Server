export const convertAggregateArrayToObjectWithYearlyKeys = (arr: any, stock: any) =>
    arr?.reduce((p: any, c: any) => ({
        ...p, [c._id.year]: c
    }), {});

export const mergeStockAndAggregateYearlyFinancials = (stock: any, aggregate_for_todo: any) => stock && aggregate_for_todo &&
    (Object.entries(stock.yearlyFinancials) as any)
        .filter(([key, value]: any) => !!value && key !== '__typename')
        .reduce(
            (p: any, [k, v]: any) => ({
                ...p,
                [k]: (k === "years") ? v : v.map((v_: any) => ({
                    ...v_,
                    aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                        aggregate_for_todo.getAggregateForFinancialRows.financialRows[`${k}_${v_.title}`],
                        stock
                    ),
                    ...v_.subRows && {
                        subRows: v_.subRows.map((v__: any) => ({
                            ...v__,
                            aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                                aggregate_for_todo.getAggregateForFinancialRows.financialRows[`${k}_${v_.title}_${v__.title}`],
                                stock
                            ),
                        }))
                    }
                }))
            }),
            {}
        );

export const mergeStockAndAggregatesForYearlyFinancials = ({
    stock, aggregates
}: {
    stock: any, aggregates: any
}) => stock && aggregates && (Object.entries(stock.yearlyFinancials) as any)
        .filter(([key, value]: any) => !!value && key !== '__typename')
        .reduce(
            (p: any, [k, v]: any) => ({
                ...p,
                [k]: (k === "years") ? v : v.map((v_: any) => ({
                    ...v_,
                    ...Object.entries(aggregates).reduce((p_, [aggKey, aggValue]: any) => ({
                        ...p_,
                        [aggKey]: convertAggregateArrayToObjectWithYearlyKeys(
                            aggValue.financialRows[`${k}_${v_.title}`],
                            stock
                        ),
                    }), { key: `${k}.${v_.title}` }),
                    ...v_.subRows && {
                        subRows: v_.subRows.map((v__: any) => ({
                            ...v__,
                            ...Object.entries(aggregates).reduce((p_, [aggKey, aggValue]: any) => ({
                                ...p_,
                                [aggKey]: convertAggregateArrayToObjectWithYearlyKeys(
                                    aggValue.financialRows[`${k}_${v_.title}_${v__.title}`],
                                    stock
                                ),
                            }), {})
                        }))
                    }
                }))
            }),
            {}
        );

export const mergeAggregateCalculations = (calculationResults: any, aggregate_for_todo: any, stock: any) =>
    calculationResults?.length && aggregate_for_todo?.getAggregateForFinancialRows?.calcRows &&
    (Object.entries(calculationResults) as any)
        .filter(([key, value]: any) => !!value && key !== '__typename')
        .map(
            ([k, v]: any) => ({
                ...v,
                aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                    aggregate_for_todo.getAggregateForFinancialRows.calcRows[`calc_${v.title}`],
                    stock
                ),
            })
        );