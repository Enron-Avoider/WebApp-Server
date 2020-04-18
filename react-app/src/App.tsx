import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import loadable from '@loadable/component';

import Header from '@components/shared/Header';

export default function App() {
    return (
        <>
            <Router>
                <Header />

                <Switch>
                    <Route path="/stock/:ticker" component={loadable(() => import('./components/Routes/Page1'))} />
                </Switch>
            </Router>
        </>
    );
}
