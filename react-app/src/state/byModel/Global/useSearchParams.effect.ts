import { useState, useEffect } from 'react';
import { useLocation, useHistory } from "react-router-dom";

export default function useSearchParams() {
    const location = useLocation();
    const history = useHistory();

    const allSearchParams = Object.fromEntries(new URLSearchParams(location.search)) as {
        visibleFinancials?: 'pl' | 'bs' | 'cf',
        showPercentage?: boolean,
        ratioCollections?: string,
        comparisons?: string,
        stockName?: string,
        
        // for calc modal
        ticker?: string,
        ratio?: string,
        ratioCollection?: string,
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
            .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})).toString();

    const updateParams = ({ search }: { search: string }) =>
        history.push({
            pathname: location.pathname,
            search
        })

    return {
        allSearchParams,
        getNewSearchParamsString,
        updateParams
    };
}