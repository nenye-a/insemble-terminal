import { RouteProps } from 'react-router-dom';

import {
  ResultsScene,
  SignUpScene,
  LoginScene,
  TerminalHomeScene,
  AuthScene,
  EmailVerificationScene,
  VerificationSuccessfulScene,
  TerminalDetailScene,
  LandingScene,
} from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
  showSearchBar?: boolean;
};

export const unAuthenticatedRoutes = [
  {
    path: '/',
    exact: true,
    component: LandingScene,
  }, // TODO: change component
  { path: '/signup', component: SignUpScene, showSearchBar: false },
  { path: '/login', component: LoginScene, showSearchBar: false },
  {
    path: '/email-verification/:verificationId',
    component: EmailVerificationScene,
    showSearchBar: false,
  },
  {
    path: '/verification-successful',
    component: VerificationSuccessfulScene,
    showSearchBar: false,
  },
];

export const authenticatedRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: LandingScene,
  }, // TODO: change component
  {
    path: '/results',
    component: ResultsScene,
    showHeader: false,
  },
  {
    path: '/terminals',
    component: TerminalHomeScene,
    exact: true,
  },
  {
    path: '/terminals/:terminalId',
    component: TerminalDetailScene,
  },
];
