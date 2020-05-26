import React, { useState } from 'react';
import styled from 'styled-components';

import { ClickAway, Card, View, Text } from '../core-ui';
import { DARK_TEXT_COLOR } from '../constants/colors';
import { ReviewTag, LocationTagInput } from '../generated/globalTypes';
import { SearchVariables } from '../generated/Search';

import SearchFilterBar from './SearchFilterBar';

type Props = {
  onClickAway: () => void;
};
export default function ComparisonPopover(props: Props) {
  let { onClickAway } = props;
  let [activeComparison, setActiveComparison] = useState<
    Array<SearchVariables>
  >([]);
  return (
    <ClickAway onClickAway={onClickAway}>
      <Container>
        {activeComparison.length > 0 && (
          <View>
            <Title>Active Comparison</Title>
            {/* TODO: get array from BE */}
            {activeComparison.map((comparison, idx) => (
              <SearchFilterBar
                key={idx}
                defaultReviewTag={comparison.reviewTag as ReviewTag}
                defaultBusinessTag={''}
                defaultLocationTag={comparison.locationTag as LocationTagInput}
                disableAll
              />
            ))}
          </View>
        )}
        <View>
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
    </ClickAway>
  );
}

const Container = styled(Card)`
  margin-top: 12px;
  padding: 20px 30px;
  position: absolute;
  right: 0;
  z-index: 99;
  width: 700px;
  overflow: visible;
`;

const Title = styled(Text)`
  color: ${DARK_TEXT_COLOR};
  padding-bottom: 12px;
`;
