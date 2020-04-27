// TODO: Move all this to server

import numeral from 'numeral';

export const priceTableMap = (years: any, shareClasses: any) => [shareClasses[0]
    .yearlyPrices.priceData
    .reduce((acc: any, curr: any, i: number) => ({
        ...acc,
        [`${years[i]}`]: numeral(curr ? curr.closeAdj : '0').format('(0.00a)')
    }), { title: `${shareClasses[0].shareClassName} Price` })];

export const outstandingSharesTableMap = (years: any, aggregatedShares: any) => [aggregatedShares
    .reduce((acc: any, curr: any, i: number) => ({
        ...acc,
        [`${years[i]}`]: numeral(curr ? curr.value : '0').format('(0.00a)')
    }), { title: 'Outstanding Shares' })];

export const mergeCalculationsWithTable = (years:any, table: any, calculations=[]) => [
    ...table,
    ...[    // blank divider row
        years.reduce((acc: any, curr: any, i: number) => ({
            ...acc,
            [`${curr}`]: ``
        }), { title: '', type: 'separator' })
    ],
    ...[    // blank divider row
        years.reduce((acc: any, curr: any, i: number) => ({
            ...acc,
            [`${curr}`]: `${curr}`
        }), { title: '' })
    ],
    ...calculations
];
