import { useContext } from 'react';

import { ViewportListenerContext } from '../context';

export default function useViewport() {
  // Return hooks to determine the viewport of current  view
  return useContext(ViewportListenerContext);
}
