import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SHADOW_COLOR,
  SLIGHT_GRAY,
} from '../../constants/colors';
import { DemoType } from '../../generated/globalTypes';
import activitySearchbarDemo from '../../assets/images/activity-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import CustomerActivityResult from '../results/CustomerActivityResult';

export default function ActivityContent() {
  let demonstrationText = (
    <Text color={DARK_TEXT_COLOR} style={{ alignSelf: 'flex-end' }}>
      * Data in this example data, for demonstration purposes only
    </Text>
  );
  return (
    <View>
      <Title>Activity</Title>
      <SubTitle>Consumer activity graphed over each day</SubTitle>
      <Paragraph>
        Insemble graphs the activity of brands, so you get the best sense of
        when businesses are being visited.
      </Paragraph>
      <SearchBar src={activitySearchbarDemo} />
      <SvgFourDotsArrow style={{ alignSelf: 'center', color: SLIGHT_GRAY }} />
      <CustomerActivityResult
        demoType={DemoType.BASIC}
        containerStyle={{ paddingBottom: 8 }}
      />
      {demonstrationText}
      <SubTitle>Comparisons</SubTitle>
      <Paragraph>
        As mentioned in the overview. You can compare the activity of one
        location with another. Here’s what the comparison view looks like.
      </Paragraph>
      <CustomerActivityResult
        demoType={DemoType.WITH_COMPARE}
        containerStyle={{ paddingBottom: 8 }}
      />
      {demonstrationText}
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
