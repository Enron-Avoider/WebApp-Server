import { useQuery } from "@apollo/client";

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { GET_LAST_YEAR_COUNTS } from '@state/byModel/Aggregate/aggregate.queries';

export default function getComparisonOptions() {

    const { allSearchParams } = useSearchParams();
    const { loading: lastYearCounts_loading, error: lastYearCounts_error, data: lastYearCounts } = useQuery(GET_LAST_YEAR_COUNTS, {
        variables: {
            query: {}
        }
    });

    const comparisonOptions: { value: string, title: string, type: string }[] = [
        // ...allSearchParams.ticker ? ([
        //     {
        //         value: 'Stock_Related__industry',
        //         title: 'Industry',
        //         type: 'Stock Related'
        //     }, {
        //         value: 'Stock_Related__sector',
        //         title: 'Sector',
        //         type: 'Stock Related'
        //     }, {
        //         value: 'Stock_Related__country',
        //         title: 'Country',
        //         type: 'Stock Related'
        //     }, {
        //         value: 'Stock_Related__exchange',
        //         title: 'Exchange',
        //         type: 'Stock Related'
        //     }
        // ]) : [],
        // lazy: refactor
        ...(lastYearCounts?.getLastYearCounts?.counts.country) ?
            lastYearCounts?.getLastYearCounts?.counts?.country?.map((c: any) => ({
                value: `country__${c._id?.replace(" ", "_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Country'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.exchange) ?
            lastYearCounts?.getLastYearCounts?.counts?.exchange?.map((c: any) => ({
                value: `exchange__${c._id?.replace(" ", "_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Exchange'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.sector) ?
            lastYearCounts?.getLastYearCounts?.counts?.sector?.map((c: any) => ({
                value: `sector__${c._id?.replace(" ", "_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Sector'
            })) :
            [],
        ...(lastYearCounts?.getLastYearCounts?.counts.industry) ?
            lastYearCounts?.getLastYearCounts?.counts?.industry?.map((c: any) => ({
                value: `industry__${c._id?.replace(" ", "_")}`,
                title: `${c._id} (${c.count})`,
                type: 'Industry'
            })) :
            []
    ];

    const getComparisonOption = (value: string) => {
        const option = comparisonOptions.find((c: any) => c.value === value);

        return `${option?.type}: ${option?.title}`;
    };

    const pickedComparisons = allSearchParams.comparisons?.split('-')
        .filter((c: any) => typeof c !== 'undefined');

    const pickedComparisonsOptions = pickedComparisons
        ?.map(v => comparisonOptions.find((c: any) => c.value === v))
        .filter((c: any) => typeof c !== 'undefined');

    return {
        comparisonOptions,
        getComparisonOption,
        pickedComparisons,
        pickedComparisonsOptions,
        comparisonOptionsLoading: lastYearCounts_loading
    };
}