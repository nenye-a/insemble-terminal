import React, { useEffect, useState, ComponentProps } from 'react';
import styled, { css } from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import {
  Card,
  View,
  Text,
  TouchableOpacity,
  Divider,
  LoadingIndicator,
  Button,
} from '../core-ui';
import { Popup } from '../components';
import {
  DARK_TEXT_COLOR,
  THEME_COLOR,
  GREY_DIVIDER,
  COLORS,
  BLACK,
} from '../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';
import {
  capitalize,
  generateRandomColor,
  lightenOrDarkenColor,
  useViewport,
} from '../helpers';
import { ReviewTag, CompareActionType } from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import {
  LocationTag,
  BusinessTagResult,
  ComparationTagWithFill,
  SearchTag,
} from '../types/types';
import {
  UpdateComparison,
  UpdateComparisonVariables,
} from '../generated/UpdateComparison';
import { UPDATE_COMPARISON } from '../graphql/queries/server/comparison';
import { GET_TERMINAL } from '../graphql/queries/server/terminals';

import SearchFilterBar from './SearchFilterBar';
import SvgRoundClose from './icons/round-close';
import SearchFilterBarMobile from './SearchFilterBarMobile';

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
  let { isDesktop } = useViewport();
  let [tableId, setTableId] = useState('');
  let [deleteAllPopupVisible, setDeleteAllPopupVisible] = useState(false);
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
      if (deleteAllPopupVisible) {
        setDeleteAllPopupVisible(false);
      }
      onUpdateComparisonCompleted(data);
    },
  });
  let refetchTerminalQueries = [
    {
      query: GET_TERMINAL,
      variables: {
        terminalId: terminalId || '',
      },
      skip: !pinId,
    },
  ];

  let onUpdateComparisonCompleted = (updateData: UpdateComparison) => {
    let { tableId, comparationTags } = updateData.updateComparison;
    let usableColors =
      reviewTag === ReviewTag.ACTIVITY ||
      reviewTag === ReviewTag.MAP ||
      reviewTag === ReviewTag.PERFORMANCE
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
    // callback to refetch the new result using the new tableId
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
        newSortOrder = sortOrder.filter((item) =>
          comparationTags.map((tag) => tag.id).includes(item),
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

  let onSearchPress = (searchTags: SearchTag) => {
    let { businessTag, businessTagWithId, locationTag } = searchTags;
    let variables = {
      reviewTag,
      businessTag,
      businessTagId: businessTagWithId?.id,
      locationTag,
      tableId,
      pinId,
      actionType: CompareActionType.ADD,
    };
    if (terminalId) {
      updateComparison({
        variables,
        refetchQueries: refetchTerminalQueries,
        awaitRefetchQueries: true,
      });
    } else {
      updateComparison({
        variables,
      });
    }
  };

  let onDeleteAll = () => {
    if (terminalId) {
      updateComparison({
        variables: {
          actionType: CompareActionType.DELETE_ALL,
          tableId,
          reviewTag,
          pinId,
        },
        refetchQueries: refetchTerminalQueries,
        awaitRefetchQueries: true,
      });
    } else {
      updateComparison({
        variables: {
          actionType: CompareActionType.DELETE_ALL,
          tableId,
          reviewTag,
          pinId,
        },
      });
    }
  };

  useEffect(() => {
    if (!tableId) {
      setTableId(tableIdProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableIdProp]);

  return (
    <Container isDesktop={isDesktop}>
      <Popup
        visible={deleteAllPopupVisible}
        title="Remove All Comparisons"
        bodyText="Do you want to remove all of your comparisons?"
        buttons={[
          { text: 'Yes', onPress: onDeleteAll },
          {
            text: 'No',
            onPress: () => {
              setDeleteAllPopupVisible(false);
            },
          },
        ]}
        loading={updateComparisonLoading}
      />
      {activeComparison && activeComparison.length > 0 ? (
        <View>
          <TitleContainer>
            <Title isDesktop={isDesktop}>Active Comparison</Title>
            <Button
              text="Delete All"
              mode="transparent"
              onPress={() => {
                setDeleteAllPopupVisible(true);
              }}
              style={{ paddingRight: isDesktop ? 38 : 9 }}
            />
          </TitleContainer>
          <ScrollView isDesktop={isDesktop}>
            {activeComparison.map((comparison) => {
              let bgColor =
                reviewTag === ReviewTag.NEWS ||
                reviewTag === ReviewTag.PERFORMANCE
                  ? comparison.fill
                  : lightenOrDarkenColor(comparison.fill || BLACK, 25);

              return (
                <Row key={'row_' + comparison.id}>
                  <Circle style={{ backgroundColor: bgColor }} />
                  {isDesktop ? (
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
                  ) : (
                    <SearchFilterBarMobile
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
                      disableAll={true}
                      hideReviewTag={true}
                    />
                  )}
                  <CloseContainer
                    key={'del_' + comparison.id}
                    onPress={() => {
                      if (terminalId) {
                        updateComparison({
                          variables: {
                            reviewTag,
                            comparationTagId: comparison.id,
                            tableId,
                            actionType: CompareActionType.DELETE,
                            pinId,
                          },
                          refetchQueries: refetchTerminalQueries,
                          awaitRefetchQueries: true,
                        });
                      } else {
                        updateComparison({
                          variables: {
                            reviewTag,
                            comparationTagId: comparison.id,
                            tableId,
                            actionType: CompareActionType.DELETE,
                            pinId,
                          },
                        });
                      }
                    }}
                  >
                    <SvgRoundClose viewBox="0 0 20 20" width={20} height={20} />
                  </CloseContainer>
                </Row>
              );
            })}
          </ScrollView>
          <ComparisonDivider isDesktop={isDesktop} />
        </View>
      ) : null}
      {updateComparisonLoading ? (
        <LoadingIndicator />
      ) : isDesktop ? (
        <SearchbarContainer>
          <Title>Please select a query to compare with this table.</Title>
          <SearchFilterBar
            disableReviewTag={true}
            defaultReviewTag={capitalize(reviewTag)}
            onSearchPress={onSearchPress}
          />
        </SearchbarContainer>
      ) : (
        <SearchFilterBarMobile
          disableReviewTag={true}
          defaultReviewTag={capitalize(reviewTag)}
          onSearchPress={onSearchPress}
          focus={true}
        />
      )}
    </Container>
  );
}

type ContainerProps = ComponentProps<typeof Card> & WithViewport;

const Container = styled(Card)<ContainerProps>`
  width: ${({ isDesktop }) => (isDesktop ? '850px' : '90vw')};
  padding: ${({ isDesktop }) => (isDesktop ? '20px 16px' : '16px')};
  margin-top: 12px;
  overflow: visible;
`;

const Title = styled(Text)<TextProps & WithViewport>`
  color: ${DARK_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-bottom: 12px;
  padding: ${({ isDesktop }) => (isDesktop ? '0 38px' : '0 4px')};
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  margin: 2px 6px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;

const CloseContainer = styled(TouchableOpacity)`
  margin-left: 12px;
`;

const ComparisonDivider = styled(Divider)`
  background-color: ${GREY_DIVIDER};
  height: 2px;
  ${({ isDesktop }) =>
    isDesktop
      ? css`
          margin: 28px 38px;
        `
      : css`
          margin: 28px 8px;
        `}
`;

const Circle = styled(View)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-right: 12px;
`;

const ScrollView = styled(View)<ViewProps & WithViewport>`
  overflow-y: scroll;
  height: fit-content;
  max-height: ${({ isDesktop }) => (isDesktop ? '200px' : '100px')};
`;

const SearchbarContainer = styled(View)`
  padding: 0 38px;
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
