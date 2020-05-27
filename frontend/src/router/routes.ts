import { RouteProps } from 'react-router-dom';

import {
  ResultsScene,
  SignUpScene,
  LoginScene,
  TerminalHomeScene,
  AuthScene,
} from '../scenes';
import { isAuthorized } from '../helpers/authorization';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
  authorization?: {
    redirectPath: string;
    isAuthorized: boolean;
  };
};

const ROUTES: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
    showHeader: false,
  }, // TODO: change component
  { path: '/signup', component: SignUpScene },
  { path: '/login', component: LoginScene },
  {
    path: '/results',
    component: ResultsScene,
    showHeader: false,
    authorization: isAuthorized,
  },
  {
    path: '/terminals',
    component: TerminalHomeScene,
    authorization: isAuthorized,
  },
];

export default ROUTES;
