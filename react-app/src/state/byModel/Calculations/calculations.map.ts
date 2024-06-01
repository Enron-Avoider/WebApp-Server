import deepFind from 'deep-find';
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
            a: 'yearlyFinancials.pl.Net Income Available to Common Shareholders',
            b: 'yearlyFinancials.aggregatedShares.common-outstanding-basic',
        },
        calc: 'a/b',
    },
];

export const scopeToRows = (scope: { [key: string]: string }, stock: any,) => {
    // console.log({ scope });

    //const scopeWithCalcScope = scope

    return Object.entries(scope)
        .filter(([k, v]: any) => !!v && k !== '__typename')
        .reduce((acc: any, [k, v]: any, i: number) => ({
            ...acc,
            // for when using another calc
            ...v.scope ? {
                ...Object.entries(v.scope)?.map(([k_, v_]) => {
                    if (v_.scope) { // 2nd level of another calc
                        return ({
                            ...Object.entries(v_.scope)?.map(([k__, v__]) => {
                                return ({
                                    [k + "_" + k_ + "_" + k__]: Object.entries(
                                        deepFind(stock, 'yearlyFinancialsWithKeys.' + v__.replace('[y-1]', '')) || []
                                    ).reduce((p__, [k___, v___]) => {

                                        const hasYearlyOffset = v__.includes('[y-1]');
                                        const isKeyANumber = !isNaN(parseInt(k___));

                                        return {
                                            ...p__,
                                            ...isKeyANumber ? { [hasYearlyOffset ? parseInt(k___) + 1 : k___]: v___ } : {},
                                            ...k___ === 'title' ? {
                                                title: v___ + (hasYearlyOffset ? '[y-1]' : '')
                                            } : {}
                                        }
                                    }, {})

                                })
                            }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
                        })
                    } else {
                        return ({
                            [k + "_" + k_]: Object.entries(
                                deepFind(stock, 'yearlyFinancialsWithKeys.' + v_.replace('[y-1]', '')) || []
                            ).reduce((p_, [k__, v__]) => {

                                const hasYearlyOffset = v_.includes('[y-1]');
                                const isKeyANumber = !isNaN(parseInt(k__));

                                return {
                                    ...p_,
                                    ...isKeyANumber ? { [hasYearlyOffset ? parseInt(k__) + 1 : k__]: v__ } : {},
                                    ...k__ === 'title' ? {
                                        title: v__ + (hasYearlyOffset ? '[y-1]' : '')
                                    } : {}
                                }
                            }, {})

                        })
                    }
                }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
            } : {},
            ...!v.scope ? {
                [k]: Object.entries(
                    deepFind(stock, 'yearlyFinancialsWithKeys.' + v.replace('[y-1]', '')) || []
                ).reduce((p_, [k_, v_]) => {

                    const hasYearlyOffset = v.includes('[y-1]');
                    const isKeyANumber = !isNaN(parseInt(k_));

                    return {
                        ...p_,
                        ...isKeyANumber ? { [hasYearlyOffset ? parseInt(k_) + 1 : k_]: v_ } : {},
                        ...k_ === 'title' ? {
                            title: v_ + (hasYearlyOffset ? '[y-1]' : '')
                        } : {}
                    }
                }, {})
            } : {}
        }), {});
}

export const doCalculations = (
    calculations: CalculationType[], years: number[], stock: any, title?: string
) => {

    // console.log({ calculations });

    return Object.entries(calculations)
        .map(([key, value]: any) => value)
        .map(forTable => {
            const scopeRows = scopeToRows(forTable.scope, stock);

            // console.log({
            //     forTable,
            //     scope: forTable.scope,
            //     scopeRows
            // });

            const isUpperCase = (string: string) => /^[A-Z]*$/.test(string);
            const isALetter = (letter_: string) => letter_.toLowerCase() != letter_.toUpperCase();

            const calcWithOtherCalcs = Array.from(forTable.calc as string)?.reduce((acc: Array<string>, letter: string) => {
                // math functions
                if (isUpperCase(letter)) {
                    if (letter === 'M') {
                        return [...acc, 'max(0,'];
                    }
                }
                //other calcs
                else if (forTable.scope?.[letter]?.scope !== undefined) {

                    // console.log({
                    //     scope: forTable.scope?.[letter]?.scope,
                    //     cond: forTable.scope?.[letter]?.scope !== undefined
                    // });

                    return [...acc, "(", ...Array.from(forTable.scope?.[letter]?.calc)?.map((letter_) => {
                        if (forTable.scope?.[letter]?.scope[letter_]?.scope !== undefined) {
                            return ["(", ...Array.from(forTable.scope?.[letter]?.scope[letter_]?.calc)?.map((letter__) => {
                                return isALetter(letter__) ? letter + "_" + letter_ + "_" + letter__ : letter__
                            }), ")"].join("");
                        } else {
                            if (isUpperCase(letter_)) {
                                if (letter_ === 'M') {
                                    return 'max(0,';
                                }
                            } else {
                                return isALetter(letter_) ? letter + "_" + letter_ : letter_
                            }
                        }
                    }), ")"];

                } else { //direct calcs
                    return [...acc, letter];
                }
            }, []).join("");

            const calc = years?.reduce((acc: any, year: any, i: number) => ({
                ...acc,
                [`${year}`]:
                    (() => {
                        try {
                            return math.evaluate(
                                calcWithOtherCalcs,
                                Object.entries(scopeRows)
                                    .reduce((acc: any, [key, value]: any, i: number) => ({
                                        ...acc,
                                        [key]: scopeRows[key][year] || 0,
                                    }), {})
                            )
                        }
                        catch (e) {
                            return null;
                        }
                    })()

            }), { title: forTable.title || title, type: 'calc', onTable: forTable.onTable });

            console.log({
                calcWithOtherCalcs,
                scope: forTable.scope,
                scopeRows,
                calc
            });

            return calc;
        });
}
