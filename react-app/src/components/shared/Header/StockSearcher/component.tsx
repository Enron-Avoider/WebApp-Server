import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import SearchIcon from '@material-ui/icons/Search';
import { MenuItem, MenuList, Paper, InputBase, Typography } from '@material-ui/core';

import { useStyles } from './styles';

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

    const classes = useStyles();

    const [name, setName] = useState<string>('');

    const [getStocks, { loading, error, data }] = useLazyQuery(SEARCH_QUERY);

    const handleInputChange = (e: any) =>
        setName(e ? e.target.value : '');

    useEffect(() => {
        name.length > 1 && getStocks({ variables: { name } })
    }, [name])

    // Typography
    return (
        <div className="StockSearcher_container">

            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon />
                </div>
                <InputBase
                    onChange={handleInputChange}
                    value={name}
                    placeholder="Stonks"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                />
            </div>

            {(name.length > 1 || loading) && (
                <Paper
                    className="StockSearcher_SearchResults"
                    elevation={3}
                    onClick={() => setName('')}
                >
                    <MenuList>
                        {loading && (
                            <MenuItem disabled={true}>
                                loading
                            </MenuItem>
                        )}
                        {data && data.findSimfinStockByName.map((d: any) => (
                            <MenuItem
                                // className="list-group-item"
                                key={d.ticker}
                                component={Link}
                                to={`/stock/${d.ticker}`}
                            >
                                <Typography noWrap={true}>
                                    {d.name}
                                </Typography>
                            </MenuItem>
                        ))}

                        {/* <MenuList>
                        <MenuItem>Profile</MenuItem>
                        <MenuItem>My account</MenuItem>
                        <MenuItem>Logout</MenuItem>
                    </MenuList> */}
                    </MenuList>
                </Paper>

                // <ul className="list-group mt-1 list-group-flush StockSearcher_SearchResults">
                //     {loading && (
                //         <li className="list-group-item">
                //             loading
                //         </li>
                //     )}
                //     {data && data.findSimfinStockByName.map((d: any) => (
                //         <li
                //             className="list-group-item"
                //             key={d.ticker}
                //         >
                //             <Link to={`/stock/${d.ticker}`}>
                //                 {d.name}
                //             </Link>
                //         </li>
                //     ))}
                // </ul>
            )}
        </div>
    );
}
