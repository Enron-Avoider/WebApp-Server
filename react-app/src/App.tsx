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
                            path="/compare/:securityOne/:securityTwo/:securityThree/:securityFour/:securityFive/:securitySix"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/compare/:securityOne/:securityTwo/:securityThree/:securityFour/:securityFive"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/compare/:securityOne/:securityTwo/:securityThree/:securityFour"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/compare/:securityOne/:securityTwo/:securityThree"
                            component={loadable(() => import('./components/routes/StockPage'))}
                        />
                        <Route
                            path="/compare/:securityOne/:securityTwo"
                            component={loadable(() => import('./components/routes/StockPage'))}
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

                        <Redirect from="/" to="/stock/BRKA" />



                    </Switch>
                    <Footer />
                </Container>
            </Router>
        </>
    );
}
