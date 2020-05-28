import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import { View } from '../core-ui';
import HeaderNavigationBar from '../components/HeaderNavigationBar';

import routes from './routes';

export default function MainRoute() {
  return (
    <Router>
      <Switch>
        {routes.map(
          (
            {
              component: Component,
              showHeader = true,
              authorization,
              ...routeProps
            },
            index,
          ) => {
            if (authorization && !authorization.isAuthorized) {
              return (
                <Redirect
                  to={{
                    pathname: authorization.redirectPath || '/login',
                  }}
                />
              );
            }
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
          },
        )}
      </Switch>
    </Router>
  );
}
