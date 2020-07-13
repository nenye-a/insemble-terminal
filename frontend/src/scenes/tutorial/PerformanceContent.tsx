import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View, Card } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SLIGHT_GRAY,
  SHADOW_COLOR,
} from '../../constants/colors';
import { useViewport } from '../../helpers';
import { PerformanceTableType, DemoType } from '../../generated/globalTypes';
import performanceSearchbarDemo from '../../assets/images/performance-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import { useTutorialContext } from '../../context';
import PerformanceTablePopover from '../results/PerformanceTablePopover';
import PerformanceResult from '../results/PerformanceResult';

import BottomNavigation from './BottomNavigation';

export default function PerformanceContent() {
  let { isDesktop } = useViewport();
  let { onPageChange } = useTutorialContext();
  let demonstrationText = (
    <Text color={DARK_TEXT_COLOR} style={{ alignSelf: 'flex-end' }}>
      * Data in this example data, for demonstration purposes only
    </Text>
  );
  return (
    <View>
      <Title>Performance</Title>
      <SubTitle>Retailer and restaurant consumer volumes</SubTitle>
      <Paragraph>
        Insemble provides the performance of retailers and restaurants in all
        markets. We show you the performance of individual locations and also of
        the market as a whole.
      </Paragraph>
      <SearchBar src={performanceSearchbarDemo} />
      <SvgFourDotsArrow
        style={{
          alignSelf: 'center',
          color: SLIGHT_GRAY,
        }}
      />
      <PerformanceResult
        title="Overall Performance"
        performanceType={PerformanceTableType.OVERALL}
        demoType={DemoType.BASIC}
      />
      {demonstrationText}
      <PerformanceResult
        title="By Location"
        performanceType={PerformanceTableType.ADDRESS}
        demoType={DemoType.BASIC}
      />
      {demonstrationText}
      <Paragraph>
        Insemble supports multiple indicators of performance.
      </Paragraph>
      <InfoboxContainer>
        <PerformanceTablePopover isDesktop={isDesktop} />
      </InfoboxContainer>
      <Paragraph>You can also view data in graph form</Paragraph>
      <PerformanceResult
        title="By Location"
        performanceType={PerformanceTableType.ADDRESS}
        demoType={DemoType.BASIC}
        initialView="graph"
      />
      {demonstrationText}
      {/* TODO: Scopes Tutorial */}
      <SubTitle style={{ paddingBottom: 26, paddingTop: 70 }}>
        Comparisons
      </SubTitle>
      <Paragraph>
        As mentioned in the overview. You can compare the performance of one
        location with another. Here’s what the comparison view looks like.
      </Paragraph>
      <PerformanceResult
        title="Overall Performance"
        performanceType={PerformanceTableType.OVERALL}
        demoType={DemoType.WITH_COMPARE}
      />
      {demonstrationText}
      <BottomNavigation
        leftButton={{
          text: 'Overview',
          onPress: () => {
            onPageChange('overview');
          },
        }}
        rightButton={{
          text: 'Activity',
          onPress: () => {
            onPageChange('activity');
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

const InfoboxContainer = styled(Card)`
  padding: 14px;
  margin: 15px 0px;
  align-self: center;
`;

const SearchBar = styled.img`
  width: 100%;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 33px 0;
`;
