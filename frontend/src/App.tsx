import React, { useEffect } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

import MainRoute from './router/MainRoute';
import apolloClient from './graphql/apolloClient';
import AuthProvider from './context/AuthContext';
import ViewportListener from './context/ViewportContext';
import './App.css';

function App() {
  let handleFirstTab = (e: KeyboardEvent) => {
    if (e.keyCode === 9) {
      document.body.classList.add('tab-pressed');
    }
  };

  let handleMouseClick = () => {
    if (document.body.classList.contains('tab-pressed')) {
      document.body.classList.remove('tab-pressed');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseClick);
    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseClick);
    };
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ViewportListener>
        <AuthProvider>
          <MainRoute />
        </AuthProvider>
      </ViewportListener>
    </ApolloProvider>
  );
}

export default App;
