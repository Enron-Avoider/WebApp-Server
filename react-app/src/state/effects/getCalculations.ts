import { useState, useEffect } from 'react';
import ls, { get , set } from 'local-storage';

export type CalculationType = {
    onTable?: string,
    title?: string,
    scope: {
        [key: string]: string,
    },
    calc: string,
}

export default () => {

    const [calculations, setCalculations] = useState<CalculationType[]>([])

    useEffect(() => {
        if(!calculations.length) {
            if(!get('calculations')) {
                set('calculations', defaultCalculations);
            }

            setCalculations([
                ...(get('calculations') as [])
            ]);
        }
    }, []);

    return [
        calculations,
        setCalculations
    ];
}

const defaultCalculations: CalculationType[] = [
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