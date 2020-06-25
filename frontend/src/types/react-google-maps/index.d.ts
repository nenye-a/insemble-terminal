declare module 'react-google-maps/lib/components/addons/InfoBox' {
  import { Component } from 'react';
  import { InfoBoxOptions } from 'google-maps-infobox';

  export interface InfoBoxProps {
    defaultOptions?: InfoBoxOptions;
    defaultPosition?: google.maps.LatLng;
    defaultVisible?: boolean;
    defaultZIndex?: number;
    options?: InfoBoxOptions;
    position?: google.maps.LatLng;
    visible?: boolean;
    zIndex?: number;

    onCloseClick?(): void;
    onContentChanged?(): void;
    onDomReady?(): void;
    onPositionChanged?(): void;
    onZindexChanged?(): void;
    onUnmount?(): void;
  }

  export default class InfoBox extends Component<InfoBoxProps> {}
}
