import React, { useEffect, useState } from 'react';
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
import { ReviewTag, CompareActionType } from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import { LocationTag, BusinessTagResult } from '../types/types';
import { GetPerformanceTable_performanceTable_comparationTags as ComparationTag } from '../generated/GetPerformanceTable';
import {
  UpdateComparison,
  UpdateComparisonVariables,
} from '../generated/UpdateComparison';
import { UPDATE_COMPARISON } from '../graphql/queries/server/comparison';

import SearchFilterBar from './SearchFilterBar';
import SvgRoundClose from './icons/round-close';

type Props = {
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (tableId: string) => void;
  activeComparison?: Array<ComparationTag>;
};

export default function ComparisonPopover(props: Props) {
  let {
    reviewTag,
    tableId,
    onTableIdChange,
    activeComparison: activeComparisonProp = [],
  } = props;
  let [activeComparison, setActiveComparison] = useState<Array<any>>(
    activeComparisonProp || [],
  );
  let [
    updateComparison,
    {
      data: updateComparisonData,
      loading: updateComparisonLoading,
      error: updateComparisonError,
    },
  ] = useMutation<UpdateComparison, UpdateComparisonVariables>(
    UPDATE_COMPARISON,
    {
      // temp solution to handle https://github.com/apollographql/apollo-client/issues/6070
      onError: () => {},
    },
  );

  useEffect(() => {
    let mapFn = ({
      id,
      locationTag,
      businessTag,
    }: {
      id: string;
      locationTag: LocationTag;
      businessTag: BusinessTagResult;
    }) => ({
      id,
      locationTag: locationTag
        ? {
            id: locationTag.id,
            type: locationTag.type,
            params: locationTag.params,
          }
        : null,
      businessTag: businessTag
        ? {
            id: businessTag.id,
            type: businessTag.type,
            params: businessTag.params,
          }
        : null,
    });

    if (updateComparisonData) {
      onTableIdChange &&
        onTableIdChange(updateComparisonData.updateComparison.tableId);
      let activeComparisonList = updateComparisonData.updateComparison.comparationTags.map(
        mapFn,
      );

      setActiveComparison(activeComparisonList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateComparisonData]);

  return (
    <Container>
      <Alert
        visible={!!updateComparisonError}
        text={updateComparisonError?.message || ''}
      />
      {activeComparison && activeComparison.length > 0 ? (
        <View>
          <Title>Active Comparison</Title>
          {activeComparison.map((comparison) => (
            <Row key={'row_' + comparison.id}>
              <SearchFilterBar
                key={'search_' + comparison.id}
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
                key={'del_' + comparison.id}
                onPress={() => {
                  updateComparison({
                    variables: {
                      reviewTag,
                      comparationTagId: comparison.id,
                      tableId,
                      actionType: CompareActionType.DELETE,
                    },
                  });
                }}
              >
                <SvgRoundClose />
              </CloseContainer>
            </Row>
          ))}
          <ComparisonDivider />
        </View>
      ) : null}
      {updateComparisonLoading ? (
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
              updateComparison({
                variables: {
                  reviewTag,
                  businessTag,
                  businessTagId,
                  locationTag,
                  tableId,
                  actionType: CompareActionType.ADD,
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
  margin: 2px 0;
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
