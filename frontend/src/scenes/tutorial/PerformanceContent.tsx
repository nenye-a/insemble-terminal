import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View, Card } from '../../core-ui';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { DARK_TEXT_COLOR, GRAY } from '../../constants/colors';
import { useViewport } from '../../helpers';
import { PerformanceTableType, DemoType } from '../../generated/globalTypes';
import searchBox from '../../assets/images/performance-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import PerformanceTablePopover from '../results/PerformanceTablePopover';
import PerformanceResult from '../results/PerformanceResult';

export default function PerformanceContent() {
  let { isDesktop } = useViewport();
  return (
    <View>
      <Title>Performance</Title>
      <SubTitle>Retailer and restaurant consumer volumes</SubTitle>
      <Paragraph>
        Insemble provides the performance of retailers and restaurants in all
        markets. We show you the performance of individual locations and also of
        the market as a whole.
      </Paragraph>
      <img src={searchBox} alt="" />
      <SvgFourDotsArrow
        style={{ marginBottom: 20, alignSelf: 'center', color: GRAY }}
      />
      <PerformanceResult
        title="Overall Performance"
        performanceType={PerformanceTableType.OVERALL}
        demo={DemoType.BASIC}
      />
      <PerformanceResult
        title="By Location"
        performanceType={PerformanceTableType.ADDRESS}
        demo={DemoType.BASIC}
      />
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
        demo={DemoType.BASIC}
        initialView="graph"
      />
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
        demo={DemoType.WITH_COMPARE}
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
