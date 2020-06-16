import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import {
  Card,
  View,
  Text,
  TouchableOpacity,
  Divider,
  LoadingIndicator,
} from '../core-ui';
import {
  DARK_TEXT_COLOR,
  THEME_COLOR,
  GREY_DIVIDER,
  COLORS,
  BLACK,
} from '../constants/colors';
import {
  capitalize,
  generateRandomColor,
  lightenOrDarkenColor,
} from '../helpers';
import { ReviewTag, CompareActionType } from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import {
  LocationTag,
  BusinessTagResult,
  ComparationTagWithFill,
} from '../types/types';
import {
  UpdateComparison,
  UpdateComparisonVariables,
} from '../generated/UpdateComparison';
import { UPDATE_COMPARISON } from '../graphql/queries/server/comparison';
import { GET_TERMINAL } from '../graphql/queries/server/terminals';

import SearchFilterBar from './SearchFilterBar';
import SvgRoundClose from './icons/round-close';

type Props = {
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (tableId: string) => void;
  activeComparison?: Array<ComparationTagWithFill>;
  sortOrder?: Array<string>;
  onSortOrderChange?: (order: Array<string>) => void;
  pinId?: string;
  terminalId?: string;
};

export default function ComparisonPopover(props: Props) {
  let {
    reviewTag,
    tableId: tableIdProp,
    onTableIdChange,
    activeComparison: activeComparisonProp = [],
    sortOrder,
    onSortOrderChange,
    pinId,
    terminalId,
  } = props;
  let alert = useAlert();
  let [tableId, setTableId] = useState('');
  let [activeComparison, setActiveComparison] = useState<
    Array<ComparationTagWithFill>
  >(activeComparisonProp || []);
  let [updateComparison, { loading: updateComparisonLoading }] = useMutation<
    UpdateComparison,
    UpdateComparisonVariables
  >(UPDATE_COMPARISON, {
    onError: () => {
      alert.show('Fail to update comparison. Please try again');
    },
    onCompleted: (data) => {
      onUpdateComparisonCompleted(data);
    },
  });
  let refetchTerminalQueries = pinId
    ? [
        {
          query: GET_TERMINAL,
          variables: {
            terminalId: terminalId || '',
          },
        },
      ]
    : [];

  let onUpdateComparisonCompleted = (updateData: UpdateComparison) => {
    let { tableId, comparationTags } = updateData.updateComparison;
    let usableColors =
      reviewTag === ReviewTag.ACTIVITY || reviewTag === ReviewTag.COVERAGE
        ? COLORS.slice(1)
        : COLORS;

    let mapFn = (
      {
        id,
        locationTag,
        businessTag,
      }: {
        id: string;
        locationTag: LocationTag;
        businessTag: BusinessTagResult;
      },
      index: number,
    ) => {
      let circleColor = usableColors[index]
        ? reviewTag === ReviewTag.PERFORMANCE || reviewTag === ReviewTag.NEWS
          ? lightenOrDarkenColor(usableColors[index], 25)
          : usableColors[index]
        : generateRandomColor();
      return {
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
        fill: circleColor,
      };
    };
    onTableIdChange && onTableIdChange(tableId);
    let newSortOrder: Array<string> = [];
    if (sortOrder && onSortOrderChange) {
      if (comparationTags.length > sortOrder.length) {
        // add new comparison
        let newComparison = comparationTags.filter((tag) => {
          if (sortOrder) {
            return !sortOrder.includes(tag.id);
          }
          return false;
        });
        if (newComparison.length === 1) {
          newSortOrder = [...sortOrder, newComparison[0].id];
          onSortOrderChange(newSortOrder);
        }
      } else if (comparationTags.length < sortOrder.length) {
        // remove comparison
        newSortOrder = sortOrder.filter(
          (item) => !comparationTags.map((tag) => tag.id).includes(item),
        );
        onSortOrderChange(newSortOrder);
      }
    }
    setTableId(tableId);
    let activeComparisonList = comparationTags
      .sort((a, b) => newSortOrder.indexOf(a.id) - newSortOrder.indexOf(b.id))
      .map(mapFn);
    setActiveComparison(activeComparisonList);
  };

  useEffect(() => {
    if (!tableId) {
      setTableId(tableIdProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableIdProp]);

  return (
    <Container>
      {activeComparison && activeComparison.length > 0 ? (
        <View>
          <Title>Active Comparison</Title>
          {activeComparison.map((comparison) => {
            let bgColor =
              reviewTag === ReviewTag.NEWS ||
              reviewTag === ReviewTag.PERFORMANCE
                ? comparison.fill
                : lightenOrDarkenColor(comparison.fill || BLACK, 25);

            return (
              <Row key={'row_' + comparison.id}>
                <Circle style={{ backgroundColor: bgColor }} />
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
                        pinId,
                      },
                      refetchQueries: refetchTerminalQueries,
                    });
                  }}
                >
                  <SvgRoundClose />
                </CloseContainer>
              </Row>
            );
          })}
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
              let { businessTag, businessTagWithId, locationTag } = searchTags;
              updateComparison({
                variables: {
                  reviewTag,
                  businessTag,
                  businessTagId: businessTagWithId?.id,
                  locationTag,
                  tableId,
                  pinId,
                  actionType: CompareActionType.ADD,
                },
                refetchQueries: refetchTerminalQueries,
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
  padding: 20px 50px;
  width: 850px;
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
  position: absolute;
  right: -30px;
`;

const ComparisonDivider = styled(Divider)`
  background-color: ${GREY_DIVIDER};
  height: 2px;
  margin: 28px 0;
`;

const Circle = styled(View)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  position: absolute;
  left: -30px;
`;
