import React from 'react';

import './style.sass';

import StockSearcher from './StockSearcher';

export default function Header() {
    return (
        <nav className="navbar navbar-dark bg-dark">
            <a className="navbar-brand">Enron.Monster</a>
            <form className="form-inline">
                <StockSearcher />
            </form>
        </nav>
    );
}

