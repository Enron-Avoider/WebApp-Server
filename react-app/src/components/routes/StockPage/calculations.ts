export const calculations = [
    {
        onTable: 'yearlyFinancials.pl',
        title: 'Income per Share',
        scope: {
            a: 'aggregatedShares',
            b: 'yearlyFinancials.pl[Net Income Available to Common Shareholders]'
        },
        calc: 'b/a'
    },
];

export const doCalculations = (forTable: any, calculations: any, years: any, stock: any) => 
    calculations
        .filter((c: any) => c.onTable === forTable)
        .map((c: any) => {
            console.log({ c });
            return [];
        });