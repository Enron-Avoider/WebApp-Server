export const convertAggregateArrayToObjectWithYearlyKeys = (arr: any, stock: any) =>
    arr?.reduce((p: any, c: any) => ({
        ...p, [c._id.year]: {
            ...c,
            rank: (
                r => r > -1 ? r + 1 : '-'
            )(c.companies.findIndex((company: any) => company.company === stock.name)),
        }
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
                        aggregate_for_todo.getAggregateForStock.defaultRows[`${k}_${v_.title}`],
                        stock
                    ),
                    ...v_.subRows && {
                        subRows: v_.subRows.map((v__: any) => ({
                            ...v__,
                            aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                                aggregate_for_todo.getAggregateForStock.defaultRows[`${k}_${v_.title}_${v__.title}`],
                                stock
                            ),
                        }))
                    }
                }))
            }),
            {}
        );

export const mergeAggregateCalculations = (calculationResults: any, aggregate_for_todo: any, stock: any) =>
    calculationResults?.length && aggregate_for_todo?.getAggregateForStock?.calcRows &&
    (Object.entries(calculationResults) as any)
        .filter(([key, value]: any) => !!value && key !== '__typename')
        .map(
            ([k, v]: any) => ({
                ...v,
                aggregate: convertAggregateArrayToObjectWithYearlyKeys(
                    aggregate_for_todo.getAggregateForStock.calcRows[`calc_${v.title}`],
                    stock
                ),
            })
        );