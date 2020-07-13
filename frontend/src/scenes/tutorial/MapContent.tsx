import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SLIGHT_GRAY,
  SHADOW_COLOR,
} from '../../constants/colors';
import { DemoType } from '../../generated/globalTypes';
import { useTutorialContext } from '../../context';
import mapSearchboxDemo from '../../assets/images/map-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import MapResult from '../results/MapResult';
import mapResultPointer from '../../assets/images/map-result-pointer.svg';
import ResultTitle from '../results/ResultTitle';

import BottomNavigation from './BottomNavigation';

export default function MapContent() {
  let { onPageChange } = useTutorialContext();

  return (
    <View>
      <Title>Map</Title>
      <SubTitle>Map view of retailer and restaurant locations</SubTitle>
      <Paragraph>
        Insemble allows you to view all the locations of a business and category
        on a map.
      </Paragraph>
      <SearchBar src={mapSearchboxDemo} />
      <SvgFourDotsArrow style={{ alignSelf: 'center', color: SLIGHT_GRAY }} />
      <MapResult demoType={DemoType.BASIC} />
      <Paragraph>
        You can click in to locations and see details on each location.
      </Paragraph>
      <ResultTitle title="Map" demo={true} />
      <MapWithPointer src={mapResultPointer} />
      <SubTitle style={{ paddingTop: 126 }}>Comparisons</SubTitle>
      <Paragraph style={{ paddingBottom: 72 }}>
        As mentioned in the overview. You can see multiple locations on the map
        at a time. Here’s what that looks like!
      </Paragraph>
      <MapResult demoType={DemoType.WITH_COMPARE} />
      <BottomNavigation
        leftButton={{
          text: 'Activity',
          onPress: () => {
            onPageChange('activity');
          },
        }}
        rightButton={{
          text: 'News',
          onPress: () => {
            onPageChange('news');
          },
        }}
      />
    </View>
  );
}

const Text = styled(BaseText)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
const Title = styled(Text)`
  font-size: 30px;
  padding: 6px 0;
`;

const SubTitle = styled(Text)`
  font-size: 20px;
  color: ${DARK_TEXT_COLOR};
`;

const Paragraph = styled(Text)`
  padding: 30px 0;
`;

const SearchBar = styled.img`
  width: 100%;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 33px 0;
`;

const MapWithPointer = styled.img`
  width: 100%;
`;
