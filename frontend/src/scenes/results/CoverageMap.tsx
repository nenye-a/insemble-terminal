import React from 'react';
import { GoogleMap, withGoogleMap, Marker } from 'react-google-maps';

import { View } from '../../core-ui';
import { GRAY } from '../../constants/colors';
import { CoverageWithFill } from '../../types/types';

type Props = {
  data: Array<CoverageWithFill>;
};

function CoverageMap(props: Props) {
  let { data, ...otherProps } = props;
  return (
    <GoogleMap
      defaultOptions={{
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }}
      // TODO: add helper to calculate default center
      defaultCenter={{ lat: 34.0522, lng: -118.2437 }}
      zoom={10}
      {...otherProps}
    >
      {data.map((item) => {
        return item.coverageData.map((covData) => {
          let { locations } = covData;
          return locations.map(({ lat, lng }, index) => (
            <Marker
              key={`marker-${item.name}-${index}`}
              position={{ lat, lng }}
              icon={pinSymbol(item.fill)}
            />
          ));
        });
      })}
    </GoogleMap>
  );
}

function pinSymbol(color: string) {
  return {
    path:
      'M6.3,16.8v-.035c.462-2.22,2.038-4.405,4.192-6.555l.269-.247.115-.106A5.189,5.189,0,0,0,12.3,6.3,5.773,5.773,0,0,0,6.3.8h0a5.773,5.773,0,0,0-6,5.5A5.189,5.189,0,0,0,1.723,9.857l.115.106a1.71,1.71,0,0,0,.269.247c2.154,2.15,3.731,4.335,4.192,6.555V16.8m0-8.141A2.476,2.476,0,0,1,3.723,6.3,2.476,2.476,0,0,1,6.3,3.937,2.476,2.476,0,0,1,8.877,6.3,2.476,2.476,0,0,1,6.3,8.659Z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: GRAY,
    strokeOpacity: 0.2,
    scale: 1.5,
  };
}

const WithGoogleMap = withGoogleMap(CoverageMap);

export default (props: Props) => {
  return (
    <WithGoogleMap
      containerElement={<View flex />}
      mapElement={<View flex />}
      {...props}
    />
  );
};
