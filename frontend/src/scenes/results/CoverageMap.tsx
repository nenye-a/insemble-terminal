import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GoogleMap, withGoogleMap, Marker } from 'react-google-maps';

import { View } from '../../core-ui';
import { GRAY, THEME_COLOR } from '../../constants/colors';
import { isEqual } from '../../helpers';
import {
  MergedMapData,
  LocationLatLng,
  MapInfoboxPressParam,
} from '../../types/types';
import { GetMap_mapTable_data_coverageData as MapBusiness } from '../../generated/GetMap';
import { PinInfoBox } from '../../components';

type LatLng = google.maps.LatLng;

type Props = {
  data: Array<MergedMapData>;
  selectedBusiness?: MapBusiness;
  onInfoBoxPress?: (param: MapInfoboxPressParam) => void;
};

function CoverageMap(props: Props) {
  let { data, selectedBusiness, onInfoBoxPress, ...otherProps } = props;
  let mapRef = useRef<GoogleMap | null>(null);
  let [selectedPinLatLng, setSelectedPinLatLng] = useState<LatLng | null>(null);
  let flatLocations = useMemo(() => getFlatLocations(data), [data]);
  let latArr = flatLocations.map(({ lat }) => lat);
  let lngArr = flatLocations.map(({ lng }) => lng);

  // Getting the average of both lat & lng to be the default center
  let defaultCenter = {
    lat: latArr.reduce((a, b) => a + b, 0) / flatLocations.length,
    lng: lngArr.reduce((a, b) => a + b, 0) / flatLocations.length,
  };

  let onLocationMarkerClick = (latLng: LatLng) => {
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

  useEffect(() => {
    // Zoom in to selectedBusiness locations
    if (selectedBusiness && mapRef.current) {
      let bounds = new google.maps.LatLngBounds();
      // Map through all latLng
      selectedBusiness.locations.forEach((loc) => bounds.extend(loc));
      mapRef.current.fitBounds(bounds);
    }
  }, [selectedBusiness]);

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
      onMouseOut={closePinInfo}
      {...(selectedPinLatLng && { center: selectedPinLatLng })}
      {...otherProps}
    >
      {data.map((item) => {
        return item.coverageData.map((covData) => {
          let { locations } = covData;
          // when the table is hovered to a certain row
          let rowSelected = isEqual(covData, selectedBusiness);

          return locations.map((location, index) => {
            let { lat, lng, address, name, numReviews, rating } = location;
            // Non-compare data won't have fill property. Therefore set the fallback to THEME_COLOR
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
                }}
                opacity={
                  !selectedBusiness
                    ? 0.1
                    : previewVisible || rowSelected
                    ? 1
                    : 0 // Not sure why the opacity never be 0 in display. but 0 on debug console
                }
                zIndex={selectedBusiness ? (rowSelected ? 100 : 0) : 1}
              >
                <PinInfoBox
                  visible={previewVisible}
                  address={address || '-'}
                  name={name || '-'}
                  numReview={numReviews || 0}
                  rating={rating || 0}
                  markerPosition={latLng}
                  onClose={closePinInfo}
                  onInfoboxPress={() => {
                    onInfoBoxPress &&
                      onInfoBoxPress({
                        newTag: {
                          businessName: name,
                          address,
                        },
                      });
                  }}
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

function getFlatLocations(data: Array<MergedMapData>): Array<LocationLatLng> {
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
