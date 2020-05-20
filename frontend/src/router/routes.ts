import { RouteProps } from 'react-router-dom';

import { ResultsScene } from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  showHeader?: boolean;
};

const ROUTES: Array<RouteType> = [
  { path: '/', exact: true, component: ResultsScene, showHeader: false },
];

export default ROUTES;
