import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import SearchIcon from '@material-ui/icons/Search';
import { MenuItem, MenuList, Paper, InputBase, Typography } from '@material-ui/core';
import numeral from 'numeral';

import { useStyles } from './styles';

import "./style.sass";

const SEARCH_QUERY = gql`
    query($name: String!) {
        findStock(name: $name) {
            name,
            code,
            exchange,
            adjusted_close,
            currency_symbol,
            market_capitalization,
            sector,
            industry
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
                        {data && data.findStock.map((d: any, i: number) => (
                            <MenuItem
                                className="list-group-item"
                                key={d.code + d.exchange + " " + i}
                                component={Link}
                                to={`/stock/${d.code}.${d.exchange}`}
                            >
                                <Typography noWrap={true}>
                                    {d.name} ({d.exchange})・ {d.currency_symbol}{numeral(d.market_capitalization).format('(0.00a)')} ・{d.sector} ・{d.industry}
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
