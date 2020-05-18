import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { View } from '../core-ui';
import HeaderNavigationBar from '../components/HeaderNavigationBar';

import routes from './routes';

export default function MainRoute() {
  return (
    <Router>
      <Switch>
        {routes.map(({ component: Component, ...routeProps }, index) => (
          <Route
            key={index}
            render={() => (
              <View>
                <HeaderNavigationBar />
                <Component />
              </View>
            )}
            {...routeProps}
          />
        ))}
      </Switch>
    </Router>
  );
}
