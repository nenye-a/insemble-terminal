import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { View } from '../core-ui';
import { AuthScene } from '../scenes';
import { useAuth } from '../context/AuthContext';
import HeaderNavigationBar from '../components/HeaderNavigationBar';

import {
  authenticatedRoutes,
  unAuthenticatedRoutes,
  RouteType,
} from './routes';

export default function MainRoute() {
  let { isAuthenticated } = useAuth();
  let mapFn = (
    { component: Component, showHeader = true, ...routeProps }: RouteType,
    index: number,
  ) => {
    return (
      <Route
        key={index.toString() + routeProps.path}
        render={() => (
          <View>
            {showHeader && <HeaderNavigationBar />}
            <Component />
          </View>
        )}
        {...routeProps}
      />
    );
  };

  return (
    <Router>
      <Switch>
        {isAuthenticated
          ? authenticatedRoutes.map(mapFn)
          : unAuthenticatedRoutes.map(mapFn)}
        <Route component={AuthScene} />
      </Switch>
    </Router>
  );
}
