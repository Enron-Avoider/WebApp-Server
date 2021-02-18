import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from "apollo-boost";
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import purple from '@material-ui/core/colors/purple';
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from 'apollo-cache-persist';
import env from '@env';

import App from './App';
import './index.scss';
import { GET_TODOS } from '@state/byModel/Todos/todos.queries';
import { GET_CALCULATIONS } from '@state/byModel/Calculations/calculations.queries';
import { todoResolvers } from '@state/byModel/Todos/todo.resolvers';
import { calculationsResolvers } from '@state/byModel/Calculations/calculations.resolvers';

console.log({ env, todoResolvers, calculationsResolvers });

(async () => {

    const cache = new InMemoryCache();
    await persistCache({
        cache,
        storage: (window as any).localStorage,
    });
    const client = new ApolloClient({
        uri: env.graphql,
        cache,
        resolvers: {
            Mutation: {
                ...calculationsResolvers.Mutation,
                ...todoResolvers.Mutation,
            }
        }
    });

    try {
        client.readQuery({ query: GET_CALCULATIONS });
        client.readQuery({ query: GET_TODOS });
    } catch (error) {
        console.log({ error });
        client.writeData({
            data: {
                todos: [],
                calculations: [],
                // searchedStocks: [], // TODO
                // compareWith: {},    // TODO
            }
        });
    }

    const darkTheme = responsiveFontSizes(createMuiTheme({
        palette: {
            type: 'dark',
            primary: purple,
            secondary: purple,
            background: {
                default: '#212121',
                paper: '#333',
                // grey1: theme.palette.grey['800']
            }
        },
    }), { factor: 15 });

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
