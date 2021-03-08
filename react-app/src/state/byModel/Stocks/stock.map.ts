export const convertAggregateArrayToObjectWithYearlyKeys = (arr: any) =>
    arr?.reduce((p: any, c: any) => ({
        ...p, [c._id.year]: c
    }), {});

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
                    [aggKey]: convertAggregateArrayToObjectWithYearlyKeys(aggValue.financialRows[`${k}_${v_.title}`]),
                }), { key: `${k}.${v_.title}` }),
                ...v_.subRows && {
                    subRows: v_.subRows.map((v__: any) => ({
                        ...v__,
                        ...Object.entries(aggregates).reduce((p_, [aggKey, aggValue]: any) => ({
                            ...p_,
                            [aggKey]: convertAggregateArrayToObjectWithYearlyKeys(aggValue.financialRows[`${k}_${v_.title}_${v__.title}`]),
                        }), {})
                    }))
                }
            }))
        }),
        {}
    );

export const mergeCalculationsAndAggregates = ({
    aggregates, calculations, collectionId
}: {
    aggregates: any, calculations: any, collectionId: string
}) => aggregates && calculations.map((calculation: any) => ({
    ...calculation,
    ...Object.entries(aggregates).reduce((p_, [aggKey, aggValue]: any) => ({
        ...p_,
        [aggKey]: convertAggregateArrayToObjectWithYearlyKeys(aggValue.calcRows[`calc_${calculation.title}`]),
    }), { key: `${collectionId}/${calculation.title}` }),
}));