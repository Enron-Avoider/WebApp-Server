import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

import "./style.sass";

const SEARCH_QUERY = gql`
    query($name: String!) {
        findSimfinStockByName(name: $name) {
            name
            simId
            ticker
        }
    }
`;

export default function StockSearcher() {

    const [name, setName] = useState<string>('');

    const [getStocks, { loading, error, data }] = useLazyQuery(SEARCH_QUERY);

    const handleInputChange = (e: any) =>
        setName(e ? e.target.value : '');

    useEffect(() => {
        name.length > 2 && getStocks({ variables: { name } })
    }, [name])

    return (
        <>
            <input onChange={handleInputChange} value={name} />

            {loading && 'loading'}

            {name.length > 2 && (
                <ul>
                    {data && data.findSimfinStockByName.map((d: any) => (
                        <li key={d.ticker}>
                            <Link to={`/stock/${d.ticker}`}>
                                {d.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

        </>
    );
}
