import React, { useState } from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';
import { useMutation } from '@apollo/react-hooks';
import { useLocation, useParams } from 'react-router-dom';
import { useAlert } from 'react-alert';

import {
  View,
  Text,
  TouchableOpacity,
  LoadingIndicator,
  Card,
} from '../../core-ui';
import { ComparisonPopover, PinPopover } from '../../components';
import {
  THEME_COLOR,
  DISABLED_TEXT_COLOR,
  GRAY_TEXT,
} from '../../constants/colors';
import {
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
  FONT_SIZE_SMALL,
} from '../../constants/theme';
import { ComparationTagWithFill } from '../../types/types';
import SvgPin from '../../components/icons/pin';
import SvgRoundAdd from '../../components/icons/round-add';
import SvgRoundClose from '../../components/icons/round-close';
import SvgClose from '../../components/icons/close';
import {
  ReviewTag,
  LocationTagType,
  CompareActionType,
  TableType,
  BusinessType,
} from '../../generated/globalTypes';
import { UPDATE_COMPARISON } from '../../graphql/queries/server/comparison';
import {
  UpdateComparison,
  UpdateComparisonVariables,
} from '../../generated/UpdateComparison';
import { getResultTitle } from '../../helpers';
import SvgQuestionMark from '../../components/icons/question-mark';
import {
  REMOVE_PINNED_TABLE,
  GET_TERMINAL,
  GET_TERMINAL_LIST,
} from '../../graphql/queries/server/terminals';
import {
  RemovePinnedTable,
  RemovePinnedTableVariables,
} from '../../generated/RemovePinnedTable';

type Props = {
  title: string;
  noData?: boolean;
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (tableId: string) => void;
  comparisonTags?: Array<ComparationTagWithFill>;
  canCompare?: boolean;
  tableType: TableType;
  businessTag?: {
    type: BusinessType;
    params: string;
  };
  locationTag?: { type: LocationTagType; params: string };
  infoboxContent?: () => JSX.Element;
  pinTableId?: string;
  sortOrder?: Array<string>;
  onSortOrderChange?: (newSortOrder: Array<string>) => void;
  readOnly?: boolean;
};

type Params = {
  terminalId?: string;
};

export default function ResultTitle(props: Props) {
  let location = useLocation();
  let params = useParams<Params>();
  let {
    title,
    noData = false,
    reviewTag,
    tableId,
    onTableIdChange,
    comparisonTags,
    canCompare = true,
    tableType,
    businessTag,
    locationTag,
    infoboxContent,
    pinTableId,
    sortOrder,
    onSortOrderChange,
    readOnly,
  } = props;
  let alert = useAlert();
  let isTerminalScene = location.pathname.includes('terminal');
  let [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  let [pinPopoverOpen, setPinPopoverOpen] = useState(false);
  let [infoPopoverOpen, setInfoPopoverOpen] = useState(false);

  let refetchTerminalQueries = params.terminalId
    ? [
        {
          query: GET_TERMINAL,
          variables: {
            terminalId: params.terminalId || '',
          },
          skip: params.terminalId,
        },
      ]
    : [];

  let [updateComparison, { loading }] = useMutation<
    UpdateComparison,
    UpdateComparisonVariables
  >(UPDATE_COMPARISON, {
    onError: () => {},
    onCompleted: (data) => {
      onTableIdChange && onTableIdChange(data.updateComparison.tableId);
    },
  });
  let [removePinnedTable, { loading: removePinnedTableLoading }] = useMutation<
    RemovePinnedTable,
    RemovePinnedTableVariables
  >(REMOVE_PINNED_TABLE, {
    onError: (e) => {
      alert.show(e.message);
    },
    onCompleted: () => {
      alert.show('Table successfully removed');
    },
  });

  let infoboxPopover = (
    <PopoverContainer>{infoboxContent && infoboxContent()}</PopoverContainer>
  );
  let pinPopover = (
    <PinPopover
      tableId={tableId}
      tableType={tableType}
      onClickAway={() => setPinPopoverOpen(false)}
    />
  );
  let comparisonPopover = (
    <ComparisonPopover
      reviewTag={reviewTag}
      tableId={tableId}
      onTableIdChange={onTableIdChange}
      activeComparison={comparisonTags}
      sortOrder={sortOrder}
      onSortOrderChange={onSortOrderChange}
      pinId={pinTableId}
      terminalId={params.terminalId}
    />
  );

  let compareLocationText =
    comparisonTags && comparisonTags.length > 0
      ? comparisonTags.length === 1 && comparisonTags[0].locationTag
        ? comparisonTags[0].locationTag.type === LocationTagType.ADDRESS
          ? `near ${comparisonTags[0].locationTag.params}`
          : `in ${comparisonTags[0].locationTag.params}`
        : ''
      : '';

  let formattedCompareText =
    comparisonTags?.length === 1
      ? `Comparing with ${comparisonTags[0].businessTag?.params} ${compareLocationText}`
      : comparisonTags && comparisonTags?.length > 0
      ? `Comparing with ${comparisonTags.length} queries`
      : '';

  return (
    <Container>
      <Row>
        <Title noData={noData}>{title}</Title>
        {infoboxContent && (
          <Popover
            isOpen={infoPopoverOpen}
            content={infoboxPopover}
            position={['bottom']}
            onClickOutside={() => setInfoPopoverOpen(false)}
            align="start"
          >
            {(ref) => (
              <View
                ref={ref}
                onMouseEnter={() => {
                  setInfoPopoverOpen(true);
                }}
                onMouseLeave={() => {
                  setInfoPopoverOpen(false);
                }}
                style={{ marginLeft: 4, marginRight: 4 }}
              >
                <SvgQuestionMark
                  style={{ color: noData ? DISABLED_TEXT_COLOR : THEME_COLOR }}
                />
              </View>
            )}
          </Popover>
        )}
        {isTerminalScene && (
          <>
            <Title> | </Title>
            <SubTitle>
              {getResultTitle({ reviewTag, businessTag, locationTag })}
            </SubTitle>
          </>
        )}
      </Row>
      <Row>
        {formattedCompareText ? (
          loading ? (
            <LoadingIndicator />
          ) : (
            <>
              <CompareText>{formattedCompareText}</CompareText>
              {!readOnly && (
                <Touchable
                  onPress={() => {
                    updateComparison({
                      variables: {
                        actionType: CompareActionType.DELETE_ALL,
                        tableId,
                        reviewTag,
                        pinId: pinTableId,
                      },
                      awaitRefetchQueries: true,
                      refetchQueries: refetchTerminalQueries,
                    });
                  }}
                >
                  <SvgRoundClose />
                </Touchable>
              )}
            </>
          )
        ) : null}
        {canCompare && !readOnly && (
          <Popover
            isOpen={comparisonPopoverOpen}
            content={comparisonPopover}
            position={['bottom']}
            onClickOutside={() => setComparisonPopoverOpen(false)}
            align="end"
          >
            {(ref) => (
              <Touchable
                ref={ref}
                onPress={() => setComparisonPopoverOpen(true)}
                disabled={noData}
              >
                <SvgRoundAdd {...(noData && { fill: DISABLED_TEXT_COLOR })} />
              </Touchable>
            )}
          </Popover>
        )}
        {readOnly ? null : isTerminalScene ? (
          removePinnedTableLoading ? (
            <LoadingIndicator />
          ) : (
            <Touchable
              onPress={() => {
                if (pinTableId) {
                  removePinnedTable({
                    variables: {
                      pinTableId,
                    },
                    awaitRefetchQueries: true,
                    refetchQueries: [
                      {
                        query: GET_TERMINAL,
                        variables: {
                          terminalId: params?.terminalId || '',
                        },
                      },
                      { query: GET_TERMINAL_LIST },
                    ],
                  });
                }
              }}
              disabled={noData}
            >
              <SvgClose {...(noData && { fill: DISABLED_TEXT_COLOR })} />
            </Touchable>
          )
        ) : (
          <Popover
            isOpen={pinPopoverOpen}
            content={pinPopover}
            position={['bottom']}
            onClickOutside={() => setPinPopoverOpen(false)}
            align="end"
            containerStyle={{ overflow: 'visible' }}
          >
            {(ref) => (
              <Touchable
                ref={ref}
                onPress={() => setPinPopoverOpen(true)}
                disabled={noData}
              >
                <SvgPin {...(noData && { fill: DISABLED_TEXT_COLOR })} />
              </Touchable>
            )}
          </Popover>
        )}
      </Row>
    </Container>
  );
}

type TitleProps = TextProps & {
  noData: boolean;
};
const Container = styled(View)`
  padding: 8px 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const Title = styled(Text)<TitleProps>`
  color: ${(props) => (props.noData ? DISABLED_TEXT_COLOR : THEME_COLOR)};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Touchable = styled(TouchableOpacity)`
  margin-left: 12px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;

const CompareText = styled(Text)`
  color: ${THEME_COLOR};
`;

const SubTitle = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  color: ${GRAY_TEXT};
  font-weight: ${FONT_WEIGHT_BOLD};
  max-width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const PopoverContainer = styled(Card)`
  flex: 1;
  padding: 14px;
  max-width: 600px;
`;
