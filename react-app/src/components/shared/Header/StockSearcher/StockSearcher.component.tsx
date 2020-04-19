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
        <div className="StockSearcher_container">
            <input
                className="form-control"
                type="search"
                placeholder="Search Stonks"
                aria-label="Search"
                onChange={handleInputChange}
                value={name}
            />

            {(name.length > 2 || loading) && (
                <ul className="list-group mt-1 list-group-flush StockSearcher_SearchResults">
                    {loading && (
                        <li className="list-group-item">
                            loading
                        </li>
                    )}
                    {data && data.findSimfinStockByName.map((d: any) => (
                        <li
                            className="list-group-item"
                            key={d.ticker}
                        >
                            <Link to={`/stock/${d.ticker}`}>
                                {d.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
