import { RouteProps } from 'react-router-dom';

import {
  ResultsScene,
  SignUpScene,
  LoginScene,
  TerminalHomeScene,
  AuthScene,
} from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
};

export const unAuthenticatedRoutes = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
    showHeader: false,
  }, // TODO: change component
  { path: '/signup', component: SignUpScene },
  { path: '/login', component: LoginScene },
];

export const authenticatedRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
    showHeader: false,
  }, // TODO: change component
  {
    path: '/results',
    component: ResultsScene,
    showHeader: false,
  },
  {
    path: '/terminals',
    component: TerminalHomeScene,
  },
];
