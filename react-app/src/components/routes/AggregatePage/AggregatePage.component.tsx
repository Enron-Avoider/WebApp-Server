import React, { FunctionComponent, useEffect } from 'react';
import { useLazyQuery } from "react-apollo";

import { GET_LAST_YEAR_COUNTS } from '@state/byModel/Aggregate/aggregate.queries';

import './style.sass';

export const AggregatePage: FunctionComponent<{}> = ({ }) => {

    const [getAggregate, { loading, error, data }] = useLazyQuery(GET_LAST_YEAR_COUNTS);

    useEffect(() => {
        getAggregate({ variables: {
            query: {}
        } })
    }, [])

    return (
        <>
            <p>AggregatePage</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    );
}

