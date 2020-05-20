import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

import MainRoute from './router/MainRoute';
import apolloClient from './graphql/apolloClient';
import './App.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <MainRoute />
    </ApolloProvider>
  );
}

export default App;
