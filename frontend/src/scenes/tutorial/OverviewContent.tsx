import React from 'react';
import styled, { css } from 'styled-components';

import { Text as BaseText, View } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
  FONT_SIZE_SMALL,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SHADOW_COLOR,
  THEME_COLOR,
  WHITE,
} from '../../constants/colors';
import { useViewport } from '../../helpers';
import { SearchFilterBar } from '../../components';
import { LocationTagType } from '../../generated/globalTypes';
import searchBox from '../../assets/images/searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import ResultTitle from '../results/ResultTitle';

import { MENU } from './constants';

export default function OverviewContent() {
  let { isDesktop } = useViewport();
  return (
    <>
      <Title>Overview & Search</Title>
      <SubTitle>
        Finding data on the Insemble platform has never been easier.
      </SubTitle>
      <Paragraph>
        On the Insemble platform, you can quickly search to get performance data
        on retailers, restaurants, and properties. Searches can be performed
        through our search bar, located normally on the header of each screen.
        You can search for both categories and businesses, as well as for
        addresses and locations (cities and counties)
      </Paragraph>
      <img src={searchBox} />
      <Text style={{ paddingTop: 10, paddingBottom: 10 }}>
        Supported Data Searches
      </Text>
      <SupportedDataContainer>
        {MENU[0].options.map((option, index) => (
          <SupportedDataContent key={index} isDesktop={isDesktop}>
            <ReviewTagContainer>
              <Text color={WHITE} fontSize={FONT_SIZE_SMALL}>
                {option.label}
              </Text>
            </ReviewTagContainer>
            <DescriptionContainer flex>
              <Text fontSize={FONT_SIZE_SMALL}>{option.description}</Text>
            </DescriptionContainer>
          </SupportedDataContent>
        ))}
      </SupportedDataContainer>
      <SubTitle style={{ paddingBottom: 26, paddingTop: 70 }}>
        Search Results
      </SubTitle>
      <Text>
        Insemble will provide corresponding charts for each indicator search. If
        no indicator is provided, Insemble will data from all available
        indicators for the search.
      </Text>
      <SearchBarContainer>
        <SearchFilterBar
          defaultReviewTag="Performance"
          defaultBusinessTag="Starbucks"
          defaultLocationTag={{
            params: 'Los Angeles, CA',
            type: LocationTagType.ADDRESS,
          }}
        />
      </SearchBarContainer>
      <SvgFourDotsArrow width={30} height={30} />
      {/* TODO: Performance demo */}
      <SubTitle style={{ paddingBottom: 26, paddingTop: 70 }}>
        Comparisons
      </SubTitle>
      <ResultTitle title="By Location" noData={true} />
      <SvgFourDotsArrow />
      {/* TODO: Performance demo */}
    </>
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

const Row = styled(View)`
  flex-direction: row;
`;

const SupportedDataContainer = styled(View)`
  flex-flow: row wrap;
`;

const SupportedDataContent = styled(Row)<WithViewport>`
  flex-direction: row;
  min-height: 28px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 6px 20px 6px 0;
  ${(props) =>
    props.isDesktop
      ? css`
          width: calc(50% - 10px);
          &:nth-child(2n) {
            margin-right: 0;
          }
        `
      : css`
          width: 100%;
        `}
`;

const ReviewTagContainer = styled(View)`
  background-color: ${THEME_COLOR};
  width: 88px;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${DEFAULT_BORDER_RADIUS};
  border-bottom-left-radius: ${DEFAULT_BORDER_RADIUS};
`;

const DescriptionContainer = styled(View)`
  background-color: ${WHITE};
  padding: 4px 8px;
  border-top-right-radius: ${DEFAULT_BORDER_RADIUS};
  border-bottom-right-radius: ${DEFAULT_BORDER_RADIUS};
`;

const SearchBarContainer = styled(View)`
  padding: 14px;
  background-color: ${WHITE};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 17px 0;
`;
