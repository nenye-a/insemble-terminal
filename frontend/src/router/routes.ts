import { RouteProps } from 'react-router-dom';

import {
  AuthScene,
  ActivationScene,
  ContactUsScene,
  EditProfileScene,
  EmailVerificationScene,
  GenerateTokenScene,
  LandingScene,
  LoginScene,
  ResultsScene,
  SignUpScene,
  TerminalDetailScene,
  TerminalHomeScene,
  VerificationSuccessfulScene,
} from '../scenes';
import EditTokenScene from '../scenes/license/EditTokenScene';

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
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
];

export const authenticatedRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
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
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  { path: '/edit-profile', component: EditProfileScene },
];

export const authenticatedAdminRoutes: Array<RouteType> = [
  {
    path: '/',
    exact: true,
    component: AuthScene,
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
  { path: '/contact-us', component: ContactUsScene, showSearchBar: false },
  { path: '/edit-profile', component: EditProfileScene },
  {
    path: '/generate-token',
    component: GenerateTokenScene,
    showSearchBar: false,
  },
  {
    path: '/edit-token',
    component: EditTokenScene,
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
