import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap, withGoogleMap, Marker } from 'react-google-maps';

import { View } from '../../core-ui';
import { GRAY, THEME_COLOR } from '../../constants/colors';
import { MergedCoverageData, LocationLatLng } from '../../types/types';
import { GetCoverage_coverageTable_data_coverageData as CoverageBusiness } from '../../generated/GetCoverage';
import { PinInfoBox } from '../../components';

type LatLng = google.maps.LatLng;

type Props = {
  data: Array<MergedCoverageData>;
  selectedBusiness?: CoverageBusiness;
};

function CoverageMap(props: Props) {
  let { data, selectedBusiness, ...otherProps } = props;
  let mapRef = useRef<GoogleMap | null>(null);
  let [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  let [selectedPinLatLng, setSelectedPinLatLng] = useState<LatLng | null>(null);
  let flatLocations = getFlatLocations(data);
  let latArr = flatLocations.map(({ lat }) => lat);
  let lngArr = flatLocations.map(({ lng }) => lng);

  let defaultCenter = {
    lat: latArr.reduce((a, b) => a + b, 0) / flatLocations.length,
    lng: lngArr.reduce((a, b) => a + b, 0) / flatLocations.length,
  };

  let onLocationMarkerClick = (latLng: LatLng) => {
    // so only 1 InfoBox will be opened
    if (markerPosition) {
      setMarkerPosition(null);
    }
    setSelectedPinLatLng(latLng);
  };

  useEffect(() => {
    // so all markers will be visible
    if (mapRef.current) {
      let bounds = new google.maps.LatLngBounds();
      flatLocations.forEach((loc) => bounds.extend(loc));
      mapRef.current.fitBounds(bounds);
    }
  }, [flatLocations]);

  let closePinInfo = () => {
    setSelectedPinLatLng(null);
  };

  return (
    <GoogleMap
      ref={mapRef}
      defaultOptions={{
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }}
      defaultCenter={defaultCenter}
      zoom={0}
      onClick={closePinInfo}
      onMouseOut={closePinInfo}
      {...otherProps}
    >
      {data.map((item) => {
        return item.coverageData.map((covData) => {
          let { locations } = covData;
          let businessSelected = covData === selectedBusiness;
          let pinOpacity = businessSelected ? 1 : 0;
          return locations.map((location, index) => {
            let { lat, lng, address, name, numReviews, rating } = location;
            let pinColor = item.fill || THEME_COLOR;
            let previewVisible = selectedPinLatLng
              ? selectedPinLatLng.lat() === Number(lat) &&
                selectedPinLatLng.lng() === Number(lng)
              : false;
            let latLng = new google.maps.LatLng(Number(lat), Number(lng));
            return (
              <Marker
                key={`marker-${item.name}-${index}`}
                position={{ lat, lng }}
                icon={pinSymbol(pinColor)}
                onClick={() => {
                  onLocationMarkerClick(latLng);
                  // e.stop(); // TODO: handle if click, not zoom back to default zoom. Stop doesn't work..
                }}
                opacity={selectedBusiness ? pinOpacity : 0.5} // NOTE: I don't know if I input 1 it won't change opacity
                zIndex={selectedBusiness ? (businessSelected ? 100 : 0) : 1}
              >
                <PinInfoBox
                  visible={previewVisible}
                  address={address || '-'}
                  name={name || '-'}
                  numReview={numReviews || 0}
                  rating={rating || 0}
                  markerPosition={latLng}
                  onClose={closePinInfo}
                />
              </Marker>
            );
          });
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

function getFlatLocations(
  data: Array<MergedCoverageData>,
): Array<LocationLatLng> {
  let locations: Array<LocationLatLng> = [];

  data.forEach((item) =>
    item.coverageData.forEach((covData) =>
      covData.locations.forEach(({ lat, lng }) => {
        locations.push({ lat, lng });
      }),
    ),
  );

  return locations;
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
