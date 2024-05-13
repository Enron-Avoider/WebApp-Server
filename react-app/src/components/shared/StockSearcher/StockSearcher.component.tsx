import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useLazyQuery } from "@apollo/client";
import SearchIcon from '@mui/icons-material/Search';
import { MenuItem, MenuList, Paper, InputBase, Typography, ClickAwayListener } from '@mui/material';
import numeral from 'numeral';
import CircularProgress from '@mui/material/CircularProgress';

import { SEARCH_QUERY } from '@state/byModel/Stocks/stocks.queries';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { useStyles } from './styles';

import "./style.sass";

export default function StockSearcher() {

    const classes = useStyles().classes;

    console.log({ classes });

    const [name, setName] = useState<string>('');

    const [searchStocks, { loading, error, data }] = useLazyQuery(SEARCH_QUERY);
    const { getNewSearchParamsString } = useSearchParams();

    const handleInputChange = (e: any) =>
        setName(e ? e.target.value : '');

    useEffect(() => {
        name.length > 1 && searchStocks({ variables: { name } })
    }, [name])

    // Typography
    return (
        <ClickAwayListener onClickAway={() => setName('')}>
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
                                    <CircularProgress />
                                </MenuItem>
                            )}
                            {data && data.searchStocks.map((d: any, i: number) => (
                                <MenuItem
                                    className="list-group-item"
                                    key={d.code + " " + i}
                                    component={Link}
                                    to={
                                        {
                                            pathname: `/stock/${d.code}.${d.EODExchange}`,
                                            search: (getNewSearchParamsString({ keysToRemove: ['ticker'] }) as string)
                                        }
                                    }
                                >
                                    <Typography noWrap={true}>
                                        {d.name} ({d.code})・ {d.currency_symbol}{numeral(d.market_capitalization).format('(0.00a)')} ・{d.sector} ・{d.industry}
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
                )}
            </div>
        </ ClickAwayListener>
    );
}
