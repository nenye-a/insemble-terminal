import React, { useEffect, ComponentType } from 'react';
import ReactGA from 'react-ga';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { View } from '../core-ui';
import {
  Footer,
  HeaderNavigationBar,
  Background,
  BackgroundMode,
} from '../components';
import { useAuth } from '../context';
import { NewsPreviewModal, NotFoundScene } from '../scenes';

import {
  authenticatedRoutes,
  unAuthenticatedRoutes,
  authenticatedUnactiveRoutes,
  RouteType,
  authenticatedAdminRoutes,
} from './routes';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  background: any;
};

export default function MainRoute() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

function Routes() {
  let { isAuthenticated, user } = useAuth();
  let location = useLocation<State>();
  let background = location.state && location.state.background;

  let mapFn = (
    {
      component,
      showHeader = true,
      showSearchBar = false,
      headerMode = 'default',
      readOnly = false,
      backgroundMode,
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
            headerMode={headerMode}
            readOnly={readOnly}
            backgroundMode={backgroundMode}
          />
        )}
        {...routeProps}
      />
    );
  };
  return (
    <>
      <Switch location={background || location}>
        {isAuthenticated
          ? user?.license
            ? user?.role === 'ADMIN'
              ? authenticatedAdminRoutes.map(mapFn)
              : authenticatedRoutes.map(mapFn)
            : authenticatedUnactiveRoutes.map(mapFn)
          : unAuthenticatedRoutes.map(mapFn)}
        <Route component={NotFoundScene} />
      </Switch>
      {background && (
        <>
          <Route
            path="/news/:openNewsId/:newsId"
            children={<NewsPreviewModal />}
          />
          <Route
            path="/results/:searchId/:newsId"
            children={<NewsPreviewModal />}
          />
          <Route
            path="/terminals/:terminalId/news/:newsId"
            children={<NewsPreviewModal />}
          />
          <Route
            path="/shared/:sharedTerminalId/news/:newsId"
            children={<NewsPreviewModal />}
          />
        </>
      )}
    </>
  );
}

type RouteWithTrackerProps = {
  showHeader: boolean;
  showSearchBar?: boolean;
  component: ComponentType;
  headerMode?: 'default' | 'transparent' | 'logoOnly';
  backgroundMode?: BackgroundMode;
  readOnly?: boolean;
};

function RouteWithTracker(props: RouteWithTrackerProps) {
  let {
    showHeader,
    showSearchBar,
    component: Component,
    headerMode,
    readOnly,
    backgroundMode,
  } = props;
  let history = useHistory();

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <Background mode={backgroundMode}>
      {showHeader && (
        <HeaderNavigationBar
          showSearchBar={showSearchBar}
          onSearchPress={(search) => {
            history.push('/results', { search });
          }}
          mode={headerMode}
          readOnly={readOnly}
        />
      )}
      <View flex style={{ minHeight: '90vh' }}>
        <Component />
      </View>
      <Footer />
    </Background>
  );
}
