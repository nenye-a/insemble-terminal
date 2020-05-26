import { RouteProps } from 'react-router-dom';

import {
  ResultsScene,
  SignUpScene,
  LoginScene,
  TerminalHomeScene,
} from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
};

const ROUTES: Array<RouteType> = [
  { path: '/', exact: true, component: ResultsScene, showHeader: false }, // TODO: change component
  { path: '/signup', component: SignUpScene },
  { path: '/login', component: LoginScene },
  { path: '/results', component: ResultsScene, showHeader: false },
  { path: '/terminals', component: TerminalHomeScene },
];

export default ROUTES;
