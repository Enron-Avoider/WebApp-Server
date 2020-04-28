import deepFind from 'deep-find';
import numeral from 'numeral';
import * as math from 'mathjs';
// https://github.com/yashprit/deep-find#readme

export const calculations = [
    {
        onTable: 'Income Statement',
        title: 'Income per Share',
        scope: {
            a: 'aggregatedShares',
            b: 'yearlyFinancials.pl[Net Income Available to Common Shareholders]'
        },
        calc: 'b/a'
    },
];

export const doCalculations = (calculations: any, years: any, stock: any) =>
    calculations
        // .filter((c: any) => c.onTable === forTable)
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
                        math.evaluate(forTable.calc, Object.entries(forTable.scope)
                            .reduce((acc: any, [key, value]: any, i: number) => ({
                                ...acc,
                                [key]: numeral(scope[key][year]).value(),
                            }), {}))
                    ).format('(0.00a)')
            }), { title: forTable.title, type: 'calc',  onTable: forTable.onTable })

            console.log({ scope, calc });
            return calc;


            // const populatedScope = c.scope.

            // console.log({
            //     c,
            //     a: deepFind(stock, c.scope.a),
            //     b: deepFind(stock, c.scope.b)
            // });



            return [];
        });