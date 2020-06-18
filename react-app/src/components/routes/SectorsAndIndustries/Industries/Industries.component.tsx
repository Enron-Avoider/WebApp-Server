import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/react-hooks";

import { GET_ALL_INDUSTRIES, GET_ALL_SECTORS } from '@state/byModel/IndustriesAndSectors/industriesAndSectors.queries';
import './style.sass';

export const Industries: FunctionComponent = () => {

    const { loading, error, data } = useQuery(GET_ALL_INDUSTRIES);

    return (
        <>
            <p>Industries</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    );
}

