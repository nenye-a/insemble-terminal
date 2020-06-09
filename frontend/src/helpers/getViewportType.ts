import { VIEWPORT_TYPE } from '../constants/viewports';

const BREAKPOINTS = {
  mobile: { width: 768 },
  desktop: { width: 1024 },
};

export default function getViewportType(width: number) {
  let { mobile, desktop } = BREAKPOINTS;
  if (width <= mobile.width) {
    return VIEWPORT_TYPE.MOBILE;
  }
  if (width > mobile.width && width < desktop.width) {
    return VIEWPORT_TYPE.TABLET;
  } else {
    return VIEWPORT_TYPE.DESKTOP;
  }
}
