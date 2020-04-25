// TODO: Move all this to server

import numeral from 'numeral';

export const priceTableMap = (stock: any) => [stock.shareClasses[0].yearlyPrices.priceData.reduce((acc: any, curr: any, i: number) => ({
    ...acc,
    [`${stock.years[i]}`]: numeral(curr ? curr.closeAdj : '0').format('(0.00a)')
}), { title: stock.shareClasses[0].shareClassName })];

export const financialTableMap = (stock: any) => Object.getOwnPropertyNames(stock.yearlyFinancials)
    .filter((k: string) => k !== '__typename') // graphql spam
    .reduce((acc: any, key: any, i: number) =>
        ({
            ...acc,
            [key]: stock.yearlyFinancials[key]
                .reduce((acc: any, dataPoint: any, i: number) => {
                    if (dataPoint.displayLevel === '0') {
                        return [
                            ...acc,
                            dataPointValuesToTableRow(dataPoint, stock.years)
                        ];
                    } else if (dataPoint.displayLevel === '1') {
                        return [
                            ...acc.map((tableRow: any, i: number) => {
                                if (i === acc.length - 1) {
                                    return {
                                        ...tableRow,
                                        subRows: [
                                            ...tableRow.subRows,
                                            dataPointValuesToTableRow(dataPoint, stock.years)
                                        ]
                                    };
                                } else {
                                    return tableRow;
                                }
                            }),
                        ]
                    } else if (dataPoint.displayLevel === '2') {
                        return [
                            ...acc.map((tableRow: any, i: number) => {
                                if (i === acc.length - 1) {
                                    return {
                                        ...tableRow,
                                        subRows: [
                                            ...tableRow.subRows.map((tableSubRow: any, j: number) => {
                                                if (j === tableSubRow.subRows.length - 1) {
                                                    return {
                                                        ...tableSubRow,
                                                        subRows: [
                                                            ...tableSubRow.subRows,
                                                            dataPointValuesToTableRow(dataPoint, stock.years)
                                                        ]
                                                    };
                                                } else {
                                                    return tableRow;
                                                }
                                            }),
                                        ]
                                    };
                                } else {
                                    return tableRow;
                                }
                            }),
                        ]
                    } else {
                        console.log(dataPoint.displayLevel, dataPoint.standardisedName);
                        return acc;
                    }
                }, [])
        })
        , {});

const dataPointValuesToTableRow = (dataPoint: any, years: []) =>
    dataPoint.value.reduce((acc: any, value: any, i: number) => ({
        ...acc,
        [`${years[i]}`]: numeral(value).format('(0.00a)')
    }), { title: dataPoint.standardisedName, subRows: [] })