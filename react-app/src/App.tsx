import { hot } from 'react-hot-loader/root';
import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';
import loadable from '@loadable/component';
import { Container, Box } from '@material-ui/core';

import Header from '@components/shared/Header';
import Footer from '@components/shared/Footer';

function App() {
    return (
        <>
            <Router>
                <Header />

                <Container>
                    <Switch>
                        <Route
                            path="/todo"
                            component={loadable(() => import('./components/routes/TodoPage'))}
                        />
                        <Route
                            path="/stock/:ticker"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/ranking/:row"
                            component={loadable(() => import('./components/routes/Ranking'))}
                        />

                        <Redirect from="/" to="/stock/BRK-B" />

                    </Switch>
                    <Footer />
                </Container>
            </Router>
        </>
    );
}
export default hot(App);
