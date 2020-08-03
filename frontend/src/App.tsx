import React, { useEffect } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import ReactGA from 'react-ga';

import { AlertTemplate } from './core-ui';
import MainRoute from './router/MainRoute';
import apolloClient from './graphql/apolloClient';
import AuthProvider from './context/AuthContext';
import ViewportListener from './context/ViewportContext';
import './App.css';

function App() {
  let handleFirstTab = (e: KeyboardEvent) => {
    // When user tabbing, will add class tab-pressed which gives outline
    if (e.keyCode === 9) {
      document.body.classList.add('tab-pressed');
    }
  };

  let handleMouseClick = () => {
    // Hiding back the outline when switch back to mouse
    if (document.body.classList.contains('tab-pressed')) {
      document.body.classList.remove('tab-pressed');
    }
  };

  let options = {
    position: positions.TOP_CENTER,
    containerStyle: { marginTop: 60 },
    transition: transitions.FADE,
    timeout: 5000,
  };

  useEffect(() => {
    // Init google analytics
    ReactGA.initialize(process.env.REACT_APP_GA_ID || '');

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
        <AlertProvider template={AlertTemplate} {...options}>
          <AuthProvider>
            <MainRoute />
          </AuthProvider>
        </AlertProvider>
      </ViewportListener>
    </ApolloProvider>
  );
}

export default App;
