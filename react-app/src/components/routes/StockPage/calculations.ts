import deepFind from 'deep-find';
import numeral from 'numeral';
import * as math from 'mathjs';
// https://github.com/yashprit/deep-find#readme

export type CalculationType = {
    onTable?: string,
    title?: string,
    scope: {
        [key: string]: string,
    },
    calc: string,
}

export const calculations: CalculationType[] = [
    {
        onTable: 'Income Statement',
        title: 'Income per Share',
        scope: {
            a: 'yearlyFinancials.pl[Net Income Available to Common Shareholders]',
            b: 'aggregatedShares[common-outstanding-basic]',
        },
        calc: 'a/b',
    },
];

export const scopeToRows = (scope: { [key: string]: string }, stock: any,) => Object.entries(scope)
    .reduce((acc: any, [key, value]: any, i: number) => ({
        ...acc,
        [key]: (([table, row]) => {
            if (row) {
                return deepFind(stock, table)
                    .find((row_: any) => row_.title === row)
            } else {
                return deepFind(stock, table)
            }
        })(value.replace(']', '').split('[')),
    }), {});

export const doCalculations = (calculations: CalculationType[], years: number[], stock: any, title?: string) =>
    calculations
        .map(forTable => {
            const scopeRows = scopeToRows(forTable.scope, stock);

            const calc = years.reduce((acc: any, year: any, i: number) => ({
                ...acc,
                [`${year}`]:
                    numeral(
                        (() => {
                            try {
                                return math.evaluate(
                                    forTable.calc,
                                    Object.entries(forTable.scope)
                                        .reduce((acc: any, [key, value]: any, i: number) => ({
                                            ...acc,
                                            [key]: numeral(scopeRows[key][year]).value(),
                                        }), {})
                                )
                            }
                            catch (e) {
                                return 0;
                            }
                        })()
                    ).format('(0.00a)')
            }), { title: forTable.title || title, type: 'calc', onTable: forTable.onTable })

            return calc;
        });