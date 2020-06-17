import { RouteProps } from 'react-router-dom';

import {
  AuthScene,
  ActivationScene,
  ContactUsScene,
  EditProfileScene,
  EmailVerificationScene,
  LandingScene,
  LoginScene,
  ResultsScene,
  SignUpScene,
  TerminalDetailScene,
  TerminalHomeScene,
  VerificationSuccessfulScene,
  VerificationFailedScene,
  ManageTokenScene,
  UserHomeScene,
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
    showSearchBar: false,
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
  {
    path: '/verification-failed/:errorStatus',
    component: VerificationFailedScene,
    showSearchBar: false,
  },
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
];

export const authenticatedRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: UserHomeScene,
  }, // TODO: change component
  {
    path: '/results',
    component: ResultsScene,
    showHeader: false,
    showSearchBar: true,
  },
  {
    path: '/terminals',
    component: TerminalHomeScene,
    showSearchBar: true,
    exact: true,
  },
  {
    path: '/terminals/:terminalId',
    component: TerminalDetailScene,
    showSearchBar: true,
  },
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  { path: '/edit-profile', component: EditProfileScene },
];

export const authenticatedAdminRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: UserHomeScene,
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
    showSearchBar: true,
  },
  {
    path: '/terminals/:terminalId',
    component: TerminalDetailScene,
    showSearchBar: true,
  },
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  { path: '/edit-profile', component: EditProfileScene },

  {
    path: '/manage-token/:param',
    component: ManageTokenScene,
    showSearchBar: false,
  },
];

export const authenticatedUnactiveRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
  }, // TODO: change component
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  { path: '/edit-profile', component: EditProfileScene },
  { path: '/activation', component: ActivationScene, showSearchBar: false },
];
