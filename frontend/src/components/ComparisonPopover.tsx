import React, { useState } from 'react';
import styled from 'styled-components';

import { Card, View, Text, TouchableOpacity, Divider } from '../core-ui';
import {
  DARK_TEXT_COLOR,
  THEME_COLOR,
  GREY_DIVIDER,
} from '../constants/colors';
import { ReviewTag, LocationTagInput } from '../generated/globalTypes';
import { SearchVariables } from '../generated/Search';

import SearchFilterBar from './SearchFilterBar';
import SvgRoundClose from './icons/round-close';

type Props = {
  onClickAway: () => void;
};
export default function ComparisonPopover(props: Props) {
  let { onClickAway } = props;
  let [activeComparison, setActiveComparison] = useState<
    Array<SearchVariables>
  >([]);
  return (
    <Container>
      {activeComparison.length > 0 && (
        <View>
          <Title>Active Comparison</Title>
          {/* TODO: get array from BE */}
          {activeComparison.map((comparison, idx) => (
            <Row key={idx}>
              <SearchFilterBar
                defaultReviewTag={comparison.reviewTag as ReviewTag}
                defaultBusinessTag={''}
                defaultLocationTag={comparison.locationTag as LocationTagInput}
                disableAll
              />
              <CloseContainer
                onPress={() => {
                  // TODO: call be to remove comparison
                }}
              >
                <SvgRoundClose />
              </CloseContainer>
            </Row>
          ))}
          <ComparisonDivider />
        </View>
      )}
      <View style={{ zIndex: 99 }}>
        <Title>Please select a query to compare with this table.</Title>
        <SearchFilterBar
          disableReviewTag={true}
          defaultReviewTag="Performance"
          onSearchPress={(searchTags) => {
            // TODO: check if search valid, call be, move to active comparison arr
            setActiveComparison([...activeComparison, searchTags]);
          }}
        />
      </View>
    </Container>
  );
}

const Container = styled(Card)`
  margin-top: 12px;
  padding: 20px 30px;
  width: 721px;
  overflow: visible;
`;

const Title = styled(Text)`
  color: ${DARK_TEXT_COLOR};
  padding-bottom: 12px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;

  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;

const CloseContainer = styled(TouchableOpacity)`
  margin-left: 8px;
`;

const ComparisonDivider = styled(Divider)`
  background-color: ${GREY_DIVIDER};
  height: 2px;
  margin: 28px 22px 28px 0;
`;
