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

export default function App() {
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
                            path="/stock/:ticker/calculations/:tableName/:rowTitle"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/stock/:ticker/stock/:tickertwo"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/stock/:ticker"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/sector/:sector"
                            component={loadable(() => import('./components/routes/SectorOrIndustry'))}
                        />
                        <Route
                            path="/industry/:industry"
                            component={loadable(() => import('./components/routes/SectorOrIndustry'))}
                        />
                        <Route
                            path="/sectors-and-industries"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />
                        <Redirect from="/" to="/stock/BRKA" />
                    </Switch>
                    <Footer />
                </Container>
            </Router>
        </>
    );
}
