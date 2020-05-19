import { RouteProps } from 'react-router-dom';

import { ResultsScene, SignUpScene } from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
};

const ROUTES: Array<RouteType> = [
  { path: '/', exact: true, component: ResultsScene, showHeader: false }, // TODO: change path
  { path: '/sign-up', component: SignUpScene },
];

export default ROUTES;
