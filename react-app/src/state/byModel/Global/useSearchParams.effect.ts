import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

export default function useSearchParams() {
    const location = useLocation();

    const allSearchParams = Object.fromEntries(new URLSearchParams(location.search)) as {
        ticker?: string,
        ratio?: string,
        visibleFinancials?: 'pl' | 'bs' | 'cf',
        showPercentage?: boolean
    };

    const getNewSearchParamsString = ({
        keysToRemove,
        paramsToAdd
    }: {
        keysToRemove?: Array<string>,
        paramsToAdd?: Object
    }) =>
        new URLSearchParams(Object.entries({
            ...allSearchParams,
            ...paramsToAdd
        })
            .filter(([k, v]) => !keysToRemove?.includes(k))
            .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})).toString()

    return {
        allSearchParams,
        getNewSearchParamsString
    };
}