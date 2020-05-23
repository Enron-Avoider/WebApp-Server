import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from "apollo-boost";
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import purple from '@material-ui/core/colors/purple';
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from 'apollo-cache-persist';
import env from '@env';

import App from './App';
import './index.scss';
import { GET_TODOS } from '@state/graphql-queries/todos';
import { resolvers } from '@state/graphql-resolvers/todo';

console.log({ env });

(async () => {

    const cache = new InMemoryCache();
    await persistCache({
        cache,
        storage: (window as any).localStorage,
    });
    const client = new ApolloClient({
        uri: 'http://localhost:4000/',
        cache,
        resolvers
    });
    /* Initialize the local state if not yet */
    try {
        cache.readQuery({
            query: GET_TODOS
        });
    } catch (error) {
        cache.writeData({
            data: {
                todos: []
            }
        });
    }

    const darkTheme = createMuiTheme({
        palette: {
            type: 'dark',
            primary: purple,
            secondary: purple,
            background: {
                default: '#212121',
                paper: '#333'
            }
        },
    });

    ReactDOM.render(
        <ApolloProvider client={client}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </ApolloProvider>,
        document.getElementById('app')
    );

})();
