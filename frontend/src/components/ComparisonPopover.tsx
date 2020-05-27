import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';

import {
  Card,
  View,
  Text,
  TouchableOpacity,
  Divider,
  LoadingIndicator,
  Alert,
} from '../core-ui';
import {
  DARK_TEXT_COLOR,
  THEME_COLOR,
  GREY_DIVIDER,
} from '../constants/colors';
import { capitalize } from '../helpers';
import { ReviewTag } from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import {
  AddComparison,
  AddComparisonVariables,
} from '../generated/AddComparison';
import { ADD_COMPARISON } from '../graphql/queries/server/comparison';

import SearchFilterBar from './SearchFilterBar';
import SvgRoundClose from './icons/round-close';

type Props = {
  reviewTag: ReviewTag;
  tableId: string;
};

export default function ComparisonPopover(props: Props) {
  let { reviewTag, tableId } = props;

  let [
    addComparison,
    {
      data: addComparisonData,
      loading: addComparisonLoading,
      error: addComparisonError,
    },
  ] = useMutation<AddComparison, AddComparisonVariables>(ADD_COMPARISON);

  useEffect(() => {
    // callback to parent
  }, [addComparisonData]);
  return (
    <Container>
      <Alert
        visible={!!addComparisonError}
        text={addComparisonError?.message || ''}
      />
      {addComparisonData?.addComparison.comparationTags &&
        addComparisonData.addComparison.comparationTags.length > 0 && (
          <View>
            <Title>Active Comparison</Title>
            {/* TODO: get array from BE */}
            {addComparisonData.addComparison.comparationTags.map(
              (comparison, idx) => (
                <Row key={idx}>
                  <SearchFilterBar
                    defaultReviewTag={capitalize(reviewTag)}
                    defaultBusinessTag={comparison.businessTag as BusinessTag}
                    defaultLocationTag={
                      comparison.locationTag
                        ? {
                            params: comparison.locationTag.params,
                            type: comparison.locationTag.type,
                          }
                        : undefined
                    }
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
              ),
            )}
            <ComparisonDivider />
          </View>
        )}
      {addComparisonLoading ? (
        <LoadingIndicator />
      ) : (
        <View>
          <Title>Please select a query to compare with this table.</Title>
          <SearchFilterBar
            disableReviewTag={true}
            defaultReviewTag={capitalize(reviewTag)}
            onSearchPress={(searchTags) => {
              let { businessTag, businessTagId, locationTag } = searchTags;
              // TODO: check if search valid, call be, move to active comparison arr
              addComparison({
                variables: {
                  reviewTag,
                  businessTag,
                  businessTagId,
                  locationTag,
                  tableId,
                },
              });
            }}
          />
        </View>
      )}
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
