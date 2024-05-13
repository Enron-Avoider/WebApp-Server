import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';
import loadable from '@loadable/component';
import { Container, Box } from '@mui/material';

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
                            path="/ranking/:collectionId/:row"
                            component={loadable(() => import('./components/routes/Ranking'))}
                        />
                        <Route
                            path="/ranking/:row"
                            component={loadable(() => import('./components/routes/Ranking'))}
                        />
                        <Route
                            path="/home"
                            component={loadable(() => import('./components/routes/Home'))}
                        />

                        <Redirect from="/" to="/stock/AMZN?comparisons=Stock_Related__industry&ratioCollections=Valuation.9PJQ" />
                    </Switch>
                    <Footer />
                </Container>
            </Router>
        </>
    );
}
export default App;
