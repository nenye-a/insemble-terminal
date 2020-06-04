import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';

import { View } from '../core-ui';
import { AuthScene } from '../scenes';
import HeaderNavigationBar from '../components/HeaderNavigationBar';
import { localStorage } from '../helpers';

import {
  authenticatedRoutes,
  unAuthenticatedRoutes,
  RouteType,
} from './routes';

export default function MainRoute() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

function Routes() {
  let history = useHistory();
  let mapFn = (
    {
      component: Component,
      showHeader = true,
      showSearchBar,
      ...routeProps
    }: RouteType,
    index: number,
  ) => {
    return (
      <Route
        key={index.toString() + routeProps.path}
        render={() => (
          <View>
            {showHeader && (
              <HeaderNavigationBar
                showSearchBar={showSearchBar}
                onSearchPress={(search) => {
                  history.push('/results', { search });
                }}
              />
            )}
            <Component />
          </View>
        )}
        {...routeProps}
      />
    );
  };
  return (
    <Switch>
      {/* TODO: enhance useAuth */}
      {!!localStorage.getToken()
        ? authenticatedRoutes.map(mapFn)
        : unAuthenticatedRoutes.map(mapFn)}
      <Route component={AuthScene} />
    </Switch>
  );
}
