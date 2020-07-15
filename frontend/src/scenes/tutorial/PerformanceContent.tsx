import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View, Card, Pill } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SLIGHT_GRAY,
  SHADOW_COLOR,
  THEME_COLOR,
  WHITE,
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
  const SCOPES = [
    {
      searchBar: ['Business', 'Address'],
      result: [
        {
          tableType: 'Overall',
          name: 'Name',
        },
      ],
    },
    {
      searchBar: ['Business', 'City'],
      result: [
        {
          tableType: 'Overall',
          name: 'Name',
        },
        {
          tableType: 'By Location',
          name: 'Address',
        },
      ],
    },
    {
      searchBar: ['Business', 'County'],
      result: [
        {
          tableType: 'Overall',
          name: 'Name',
        },
        {
          tableType: 'By City',
          name: 'City',
        },
      ],
    },
    {
      searchBar: ['Category', 'Any'],
      result: [
        {
          tableType: 'By Brand',
          name: 'Company',
        },
      ],
    },
  ];
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
        containerStyle={{ paddingBottom: 8 }}
      />
      {demonstrationText}
      <PerformanceResult
        title="By Location"
        performanceType={PerformanceTableType.ADDRESS}
        demoType={DemoType.BASIC}
        containerStyle={{ paddingBottom: 8 }}
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
        containerStyle={{ paddingBottom: 8 }}
      />
      {demonstrationText}
      <SubTitle style={{ paddingBottom: 26, paddingTop: 70 }}>Scopes</SubTitle>
      <Paragraph>
        Performance tables support viewing the data at a variety of scopes.
        County level searches will return data by city, and city level searches
        will return data by location.
      </Paragraph>
      <View flex>
        {SCOPES.map((scope, idx) => {
          return (
            <ScopesRow key={idx}>
              <ScopesBar>
                {scope.searchBar.map((search) => {
                  return (
                    <ReviewTagContainer key={search} primary={true}>
                      {search}
                    </ReviewTagContainer>
                  );
                })}
              </ScopesBar>
              <SvgFourDotsArrow
                style={{
                  width: 64,
                  marginLeft: 8,
                  color: SLIGHT_GRAY,
                  transform: 'rotate(270deg)',
                }}
              />
              <ResultRow flex>
                {scope.result.map((result) => {
                  return (
                    <ResultContainer key={result.name}>
                      <TableTypeText>{result.tableType}</TableTypeText>
                      <ReviewTagContainer>{result.name}</ReviewTagContainer>
                    </ResultContainer>
                  );
                })}
              </ResultRow>
            </ScopesRow>
          );
        })}
      </View>
      <Text color={DARK_TEXT_COLOR} style={{ alignSelf: 'flex-start' }}>
        *Category searches will include {<BoldText>By Brand</BoldText>}, but
        otherwise follow same pattern
      </Text>
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
        containerStyle={{ paddingBottom: 8 }}
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
const BoldText = styled(BaseText)`
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const SearchBar = styled.img`
  width: 100%;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 33px 0;
`;

const ScopesBar = styled(Card)`
  padding: 6px 12px;
  flex-direction: row;
  max-width: 300px;
  flex: 1;
`;

const ReviewTagContainer = styled(Pill)`
  padding: 4px;
  flex: 1;
  margin-right: 8px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:last-of-type {
    margin: 0;
  }
`;

const ResultRow = styled(View)`
  padding: 30px 8px;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 360px;
  width: 100%;
  justify-content: center;
  flex: 1;
`;

const ResultContainer = styled(View)`
  margin: 12px;
  max-width: 120px;
  width: 100%;
  align-items: center;
`;

const TableTypeText = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const ScopesRow = styled(View)`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
