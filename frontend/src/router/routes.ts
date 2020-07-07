import { RouteProps } from 'react-router-dom';

import {
  ActivationScene,
  ContactUsScene,
  EditProfileScene,
  EmailVerificationScene,
  LandingScene,
  LoginScene,
  NewsScene,
  NewsPreviewModal,
  ResultsScene,
  SignUpScene,
  TerminalDetailScene,
  TerminalHomeScene,
  VerificationSuccessfulScene,
  VerificationFailedScene,
  ManageTokenScene,
  UserHomeScene,
  SharedTerminalDetailScene,
  ExpiredSharedTerminalScene,
} from '../scenes';
import { BackgroundMode } from '../components';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
  showSearchBar?: boolean;
  headerMode?: 'default' | 'transparent' | 'lightPurple' | 'logoOnly';
  readOnly?: boolean;
};

export const allAccessRoutes: Array<RouteType> = [
  {
    path: '/contact-us',
    component: ContactUsScene,
    showSearchBar: false,
    headerMode: 'lightPurple',
  },
  {
    path: '/shared/:sharedTerminalId',
    component: SharedTerminalDetailScene,
    readOnly: true,
    showHeader: true,
    showSearchBar: true,
  },
  {
    path: '/shared/:sharedTerminalId/news/:newsId',
    component: NewsPreviewModal,
    readOnly: true,
    showHeader: true,
    showSearchBar: true,
  },
  {
    path: '/news/:openNewsId',
    component: NewsScene,
    showHeader: false,
    exact: true,
  },
  {
    path: '/news/:openNewsId/:newsId',
    component: NewsPreviewModal,
    showHeader: false,
  },
  {
    path: '/shared-expired',
    component: ExpiredSharedTerminalScene,
    headerMode: 'lightPurple',
    exact: true,
  },
];

export const unAuthenticatedRoutes: Array<RouteType> = [
  ...allAccessRoutes,
  {
    path: '/',
    exact: true,
    component: LandingScene,
    showSearchBar: false,
  },
  {
    path: '/signup',
    component: SignUpScene,
    showSearchBar: false,
    headerMode: 'logoOnly',
  },
  {
    path: '/login',
    component: LoginScene,
    showSearchBar: false,
    headerMode: 'logoOnly',
  },
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
    exact: true,
    showHeader: false,
    showSearchBar: true,
  },
  {
    path: '/results/:searchId/news/:newsId',
    component: NewsPreviewModal,
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
    exact: true,
  },
  {
    path: '/terminals/:terminalId/news/:newsId',
    component: NewsPreviewModal,
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
  {
    path: '/activation',
    component: ActivationScene,
    showSearchBar: false,
    headerMode: 'logoOnly',
  },
];
