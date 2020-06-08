import { useContext } from 'react';

import { ViewportListenerContext } from '../context';

export default function useViewport() {
  return useContext(ViewportListenerContext);
}
