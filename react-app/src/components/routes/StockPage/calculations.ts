import deepFind from 'deep-find';
import numeral from 'numeral';
import * as math from 'mathjs';
// https://github.com/yashprit/deep-find#readme

export const calculations = [
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

export const doCalculations = (calculations: any, years: any, stock: any) =>
    calculations
        .map((forTable: any) => {
            const scope = Object.entries(forTable.scope)
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
                                            [key]: numeral(scope[key][year]).value(),
                                        }), {})
                                )
                            } 
                            catch(e) {
                                return i;
                            }
                        })()
                    ).format('(0.00a)')
            }), { title: forTable.title, type: 'calc',  onTable: forTable.onTable })

            // console.log({ scope, c: forTable.calc });
            return calc;
        });