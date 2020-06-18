import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/react-hooks";

import { GET_ALL_INDUSTRIES, GET_ALL_SECTORS } from '@state/byModel/IndustriesAndSectors/industriesAndSectors.queries';
import './style.sass';

export const Sectors: FunctionComponent = () => {

    const { loading, error, data } = useQuery(GET_ALL_SECTORS);

    return (
        <>
            <p>Sectors</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    );
}

