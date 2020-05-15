import { RouteProps } from 'react-router-dom';

import { ResultsScene } from '../scenes';

export type RouteType = Omit<RouteProps, 'component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
};

const ROUTES: Array<RouteType> = [
  { path: '/', exact: true, component: ResultsScene },
];

export default ROUTES;
