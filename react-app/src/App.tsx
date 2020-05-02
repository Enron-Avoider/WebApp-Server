import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';
import loadable from '@loadable/component';
import {Container} from '@material-ui/core';

import Header from '@components/shared/Header';

export default function App() {
    return (
        <>
            <Router>
                <Header />

                <Container>
                    <Switch>
                        <Route path="/stock/:ticker" component={loadable(() => import('./components/routes/StockPage'))} />
                        <Redirect from="/" to="/stock/BRKA" />
                    </Switch>
                </Container>
            </Router>
        </>
    );
}
