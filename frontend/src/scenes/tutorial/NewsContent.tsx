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
import NewsSearchbarDemo from '../../assets/images/news-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import { useTutorialContext } from '../../context';
import NewsResult from '../results/LatestNewsResult';

import BottomNavigation from './BottomNavigation';

export default function NewsContent() {
  let { onPageChange } = useTutorialContext();
  let demonstrationText = (
    <Text color={DARK_TEXT_COLOR} style={{ alignSelf: 'flex-end' }}>
      * Data in this example data, for demonstration purposes only
    </Text>
  );
  return (
    <View>
      <Title>News</Title>
      <SubTitle>Latest, most relevant retailer/restaurant news</SubTitle>
      <Paragraph>
        See the latest news about brands of interest. Feel free to put any
        combination of searches to get and track the latest news.
      </Paragraph>
      <SearchBar src={NewsSearchbarDemo} />
      <SvgFourDotsArrow
        style={{
          alignSelf: 'center',
          color: SLIGHT_GRAY,
        }}
      />
      <NewsResult demoType={DemoType.BASIC} />
      {demonstrationText}
      <BottomNavigation
        leftButton={{
          text: 'Map',
          onPress: () => {
            onPageChange('map');
          },
        }}
        rightButton={{
          text: 'Contacts',
          onPress: () => {
            onPageChange('contacts');
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
