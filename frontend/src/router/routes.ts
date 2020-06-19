import { RouteProps } from 'react-router-dom';

import {
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
  SharedTerminalDetailScene,
} from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
  showSearchBar?: boolean;
  headerMode?: 'default' | 'transparent';
  readOnly?: boolean;
};

export const allAccessRoutes = [
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  {
    path: '/shared/:sharedTerminalId',
    component: SharedTerminalDetailScene,
    readOnly: true,
    showHeader: true,
    showSearchBar: true,
  },
];

export const unAuthenticatedRoutes = [
  ...allAccessRoutes,
  {
    path: '/',
    exact: true,
    component: LandingScene,
    showSearchBar: false,
  },
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
];

export const authenticatedRoutes: Array<RouteType> = [
  ...allAccessRoutes,
  {
    path: '/',
    exact: true,
    component: UserHomeScene,
  },
  {
    path: '/results',
    component: ResultsScene,
    showHeader: false,
    showSearchBar: true,
    exact: true,
  },
  {
    path: '/results/:searchId',
    component: ResultsScene,
    exact: false,
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
  { path: '/edit-profile', component: EditProfileScene },
  { path: '/send-feedback', component: ContactUsScene },
];

export const authenticatedAdminRoutes: Array<RouteType> = [
  ...authenticatedRoutes,
  {
    path: '/manage-token/:param',
    component: ManageTokenScene,
    showSearchBar: false,
  },
];

export const authenticatedUnactiveRoutes: Array<RouteType> = [
  ...allAccessRoutes,
  {
    path: '/',
    exact: true,
    component: UserHomeScene,
    headerMode: 'transparent',
  },
  { path: '/edit-profile', component: EditProfileScene },
  { path: '/activation', component: ActivationScene, showSearchBar: false },
];
