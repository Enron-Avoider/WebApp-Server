import React, { FunctionComponent, useEffect } from 'react';
import { useLazyQuery } from "react-apollo";

import { GET_AGGREGATE } from '@state/byModel/Aggregate/aggregate.queries';

import './style.sass';

export const AggregatePage: FunctionComponent<{}> = ({ }) => {

    const [getAggregate, { loading, error, data }] = useLazyQuery(GET_AGGREGATE);

    useEffect(() => {
        getAggregate({ variables: {
            sector:"Technology",
            industry: "Electronic Components"
        } })
    }, [])

    return (
        <>
            <p>AggregatePage</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    );
}

