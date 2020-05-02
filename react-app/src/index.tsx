import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from "apollo-boost";
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import purple from '@material-ui/core/colors/purple';
import env from '@env';

import App from './App';
import './index.scss';

console.log({ env });

const client = new ApolloClient({
    uri: 'http://localhost:4000/',
});

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
