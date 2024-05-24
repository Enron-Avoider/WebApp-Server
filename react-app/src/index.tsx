import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, ApolloProvider, InMemoryCache, gql } from '@apollo/client';
import { ThemeProvider, responsiveFontSizes, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import purple from '@mui/material/colors/purple';
import { persistCache } from 'apollo-cache-persist';
import env from '@env';
import localforage from "localforage";

import App from './App';
import './index.scss';
import { GET_TODOS } from '@state/byModel/Todos/todos.queries';
import { GET_USER_KEYS } from '@state/byModel/User/UserKey.localQueries';
import { todoResolvers } from '@state/byModel/Todos/todo.resolvers';
import { userKeysResolvers } from '@state/byModel/User/UserKey.localResolvers';

console.log({ env });

(async () => {
    const cache = new InMemoryCache();

    if (env.environment !== 'development') {
        await persistCache({
            cache,
            storage: (localforage as any), //(window as any).localStorage, 
        });
    }
    const client = new ApolloClient({
        uri: env.graphql,
        cache,
        resolvers: {
            Mutation: {
                ...todoResolvers.Mutation,
                ...userKeysResolvers.Mutation
            }
        },
    });

    // TODO: incapsulate in promises and handle Indiviualy.
    // This lazy ass way won't scale as any unsolveable query resets
    // everything in `data`

    try {
        const getTodos = client.readQuery({ query: GET_TODOS });
        const getKeys = client.readQuery({ query: GET_USER_KEYS });

        console.log({
            getTodos,
            getKeys
        })

        if (!getKeys) {
            client.writeQuery({
                query: gql`
                  query {
                    todos
                    userKeys
                  }
                `,
                data: { todos: [], userKeys: [] }
            });
        }
    } catch (error) {
        console.log({ error });
        client.writeQuery({
            query: gql``,
            data: {
                todos: [],
                userKeys: []
            }
        });
    }

    const darkTheme = createTheme(({
        palette: {
            mode: 'dark',
            primary: purple,
            secondary: purple,
            background: {
                default: '#212121',
                paper: '#333',
                // grey1: theme.palette.grey['800']
            }
        },
    }), { factor: 15 });


    const domNode = document.getElementById('app');
    const root = ReactDOM.createRoot(domNode);
    root.render(
        <ApolloProvider client={client}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </ApolloProvider>
    );

})();
