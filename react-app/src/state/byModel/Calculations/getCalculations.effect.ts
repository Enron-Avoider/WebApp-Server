import { useState, useEffect } from 'react';
import { useQuery } from "react-apollo";

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { GET_RATIO_COLLECTIONS } from '@state/byModel/Calculations/calculations.queries';
import { doCalculations } from './calculations.map';

export default function getCalculations({ stock }: { stock: any}) {

    const { allSearchParams } = useSearchParams();

    const {
        loading: ratioCollections_loading, error: ratioCollections_error, data: ratioCollectionsQ
    } = useQuery(GET_RATIO_COLLECTIONS, {});

    const ratioCollections = ratioCollectionsQ?.getRatioCollections;

    const pickedCollections = ratioCollections ? (
        ids => ids?.map(
            (n: any) => ratioCollections.find((c: any) => c.id === n)
        )
            .filter((o: any) => typeof o !== 'undefined')
    )(allSearchParams.ratioCollections?.split('-').map(c => c.split('.')[1])) : [];

    const pickedCollectionsWithCalculations = pickedCollections?.map(c => ({
        ...c,
        calculationResults: doCalculations(c.calcs, stock.yearlyFinancials.years, stock)
    }));

    return {
        ratioCollections,
        pickedCollections,
        pickedCollectionsWithCalculations
    };
}