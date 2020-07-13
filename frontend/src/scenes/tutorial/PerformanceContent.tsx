import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View, Card } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
  FONT_SIZE_SMALL,
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
      <SubTitle style={{ paddingBottom: 26, paddingTop: 70 }}>Scopes</SubTitle>
      <Paragraph>
        Performance tables support viewing the data at a variety of scopes.
        County level searches will return data by city, and city level searches
        will return data by location.
      </Paragraph>
      {SCOPES.map((scope, idx) => {
        return (
          <ScopesRow key={idx}>
            <ScopesBar>
              {scope.searchBar.map((search) => {
                return (
                  <ReviewTagContainer key={search}>
                    <Text color={WHITE} fontSize={FONT_SIZE_SMALL}>
                      {search}
                    </Text>
                  </ReviewTagContainer>
                );
              })}
            </ScopesBar>
            <SvgFourDotsArrow
              style={{
                alignSelf: 'center',
                color: SLIGHT_GRAY,
                transform: 'rotate(270deg)',
              }}
            />
            <ResultRow>
              {scope.result.map((result) => {
                return (
                  <ResultContainer key={result.name}>
                    <TableTypeText>{result.tableType}</TableTypeText>
                    <ReviewTagContainer>
                      <Text color={WHITE} fontSize={FONT_SIZE_SMALL}>
                        {result.name}
                      </Text>
                    </ReviewTagContainer>
                  </ResultContainer>
                );
              })}
            </ResultRow>
          </ScopesRow>
        );
      })}
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
  padding: 5px 15px;
  flex-direction: row;
`;

const ReviewTagContainer = styled(View)`
  background-color: ${THEME_COLOR};
  width: 88px;
  height: 30px;
  margin: 0px 5px;
  align-items: center;
  justify-content: center;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const ResultRow = styled(View)`
  padding: 5px 15px;
  flex-direction: row;
  width: 250px;
  justify-content: center;
`;

const ResultContainer = styled(View)`
  margin: 5px;
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
  justify-content: space-evenly;
  align-items: center;
  align-self: center;
  margin: 15px;
  width: 100%;
`;
