import React, { useRef, useState } from 'react';
import InfoBox from 'react-google-maps/lib/components/addons/InfoBox';
import styled from 'styled-components';

import { Card, View, Text } from '../core-ui';
import { THEME_COLOR } from '../constants/colors';
import { FONT_SIZE_SMALL } from '../constants/theme';

type LatLng = google.maps.LatLng;
type MouseEvent = google.maps.MouseEvent;

type Props = {
  visible: boolean;
  name: string;
  address: string;
  rating: number;
  numReview: number;
  markerPosition: LatLng;
  onClose: () => void;
  onInfoboxPress: () => void;
};

/**
 * Info box that will be shown when pressing pin on coverage map marker
 */
export default function PinInfoBox(props: Props) {
  let infoRef = useRef<Element | undefined>();
  let [infoBoxHeight, setInfoBoxHeight] = useState<number>(0);

  let {
    name,
    address,
    rating,
    numReview,
    visible,
    markerPosition,
    onClose,
    onInfoboxPress,
  } = props;
  let leftText = ['Name:', 'Address:', 'Rating:', 'NumRating:'];
  let rightText = [name, address, rating, numReview];
  let handleInfoBoxPress = (e: Event) => {
    // So the onPress function not bubbling up to the parent component
    e.stopPropagation();
    onInfoboxPress();
  };
  return visible ? (
    <InfoBox
      defaultPosition={markerPosition}
      defaultVisible={true}
      options={{
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(-150, -10 - infoBoxHeight),
        infoBoxClearance: new google.maps.Size(1, 1),
        isHidden: false,
        pane: 'floatPane',
        enableEventPropagation: true,
        closeBoxMargin: '10px 0 2px 2px',
      }}
      onDomReady={() => {
        let infoBox = document.querySelector('.infoBox');
        if (infoBox) {
          infoRef.current = infoBox;
          infoRef.current.addEventListener('click', handleInfoBoxPress);
          let infoBoxHeight = infoBox.getClientRects()[0].height;
          setInfoBoxHeight(infoBoxHeight);
        }
      }}
      onCloseClick={onClose}
      onUnmount={() => {
        infoRef.current?.removeEventListener('click', handleInfoBoxPress);
      }}
    >
      <Container>
        <LeftColumn>
          {leftText.map((line, i) => (
            <SmallText key={i}>{line}</SmallText>
          ))}
        </LeftColumn>
        <RightColumn>
          {rightText.map((line, i) => (
            <RightColumnText key={i}>{line}</RightColumnText>
          ))}
        </RightColumn>
      </Container>
    </InfoBox>
  ) : null;
}

const Container = styled(Card)`
  min-width: 300px;
  height: auto;
  flex: 1;
  flex-direction: row;
  padding: 10px 20px 20px 10px;
`;

const LeftColumn = styled(View)`
  width: 100px;
  align-items: flex-start;
`;
const RightColumn = styled(View)`
  flex: 1;
  align-items: flex-start;
`;
const RightColumnText = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_SMALL};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 10px 20px 0 0;
`;
const SmallText = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  margin: 10px 0 0 0;
`;
