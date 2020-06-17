import React, { useEffect, ComponentType } from 'react';
import ReactGA from 'react-ga';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';

import { View } from '../core-ui';
import HeaderNavigationBar from '../components/HeaderNavigationBar';
import { useAuth } from '../context';
import { UserHomeScene } from '../scenes';

import {
  authenticatedRoutes,
  unAuthenticatedRoutes,
  authenticatedUnactiveRoutes,
  RouteType,
  authenticatedAdminRoutes,
} from './routes';

export default function MainRoute() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

function Routes() {
  let { isAuthenticated, user } = useAuth();
  let mapFn = (
    {
      component,
      showHeader = true,
      showSearchBar = false,
      ...routeProps
    }: RouteType,
    index: number,
  ) => {
    return (
      <Route
        key={index.toString() + routeProps.path}
        render={() => (
          <RouteWithTracker
            component={component}
            showHeader={showHeader}
            showSearchBar={showSearchBar}
          />
        )}
        {...routeProps}
      />
    );
  };
  return (
    <Switch>
      {isAuthenticated
        ? user?.license
          ? user?.role === 'ADMIN'
            ? authenticatedAdminRoutes.map(mapFn)
            : authenticatedRoutes.map(mapFn)
          : authenticatedUnactiveRoutes.map(mapFn)
        : unAuthenticatedRoutes.map(mapFn)}
      <Route component={UserHomeScene} />
    </Switch>
  );
}

type RouteWithTrackerProps = {
  showHeader: boolean;
  showSearchBar?: boolean;
  component: ComponentType;
};

function RouteWithTracker(props: RouteWithTrackerProps) {
  let { showHeader, showSearchBar, component: Component } = props;
  let history = useHistory();

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
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
  );
}
