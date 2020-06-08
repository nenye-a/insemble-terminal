import React, {
  ReactElement,
  useState,
  useEffect,
  useMemo,
  createContext,
} from 'react';

import { VIEWPORT_TYPE } from '../constants/viewports';
import { getViewportType } from '../helpers';

type Props = {
  children: ReactElement;
};

type ViewportListenerContext = {
  viewportType: VIEWPORT_TYPE;
  isDesktop: boolean;
};

let defaultContextValue = {
  viewportType: VIEWPORT_TYPE.DESKTOP,
  isDesktop: true,
};

export let ViewportListenerContext = createContext<ViewportListenerContext>(
  defaultContextValue,
);

export default function ViewportContext({ children }: Props) {
  let [viewportType, setViewportType] = useState(
    getViewportType(window.innerWidth),
  );

  let isDesktop = viewportType === VIEWPORT_TYPE.DESKTOP;

  useEffect(() => {
    let onResize = () => {
      let type = getViewportType(window.innerWidth);
      setViewportType(type);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  let value = useMemo(() => ({ viewportType, isDesktop }), [
    viewportType,
    isDesktop,
  ]);
  return (
    <ViewportListenerContext.Provider value={value}>
      {children}
    </ViewportListenerContext.Provider>
  );
}
