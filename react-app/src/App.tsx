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
                            path="/screener"
                            component={loadable(() => import('./components/routes/AggregatePage'))}
                        />
                        
                        <Route
                            path="/sector/:sector"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />
                        <Route
                            path="/industry/:industry"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />
                        <Route
                            path="/industries"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />
                        <Route
                            path="/sectors"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />
                        <Route
                            path="/sectors-and-industries"
                            component={loadable(() => import('./components/routes/SectorsAndIndustries'))}
                        />

                        {/* {[...new Array(2)].map((route, i) => {
                            const path = `${[...new Array(i)].reduce((a, c, j) => `${a}/s/:ticker${j}`, '/s/:ticker')}`;
                            console.log({ path })
                            return (
                                <Route
                                    path={path}
                                    key={i}
                                    component={() => <p>teeeest wtf {path}</p>}
                                />
                            )
                        })} */}

                        <Redirect from="/" to="/stock/BRK-B" />



                    </Switch>
                    <Footer />
                </Container>
            </Router>
        </>
    );
}
export default hot(App);
