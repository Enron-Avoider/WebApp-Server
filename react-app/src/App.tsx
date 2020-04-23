import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
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
                    </Switch>
                </Container>
            </Router>
        </>
    );
}
