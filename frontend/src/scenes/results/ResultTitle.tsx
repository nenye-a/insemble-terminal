import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';
import { useMutation } from '@apollo/react-hooks';
import { useLocation } from 'react-router-dom';

import { View, Text, TouchableOpacity, LoadingIndicator } from '../../core-ui';
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
import { ComparationTag } from '../../types/types';
import SvgPin from '../../components/icons/pin';
import SvgRoundAdd from '../../components/icons/round-add';
import SvgRoundClose from '../../components/icons/round-close';
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

type Props = {
  title: string;
  noData?: boolean;
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (tableId: string) => void;
  comparisonTags?: Array<ComparationTag>;
  canCompare?: boolean;
  tableType: TableType;
  businessTag?: {
    type: BusinessType;
    params: string;
  };
  locationTag?: { type: LocationTagType; params: string };
};

export default function ResultTitle(props: Props) {
  let location = useLocation();
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
  } = props;
  let showSubtitle = location.pathname.includes('terminal');
  let [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  let [pinPopoverOpen, setPinPopoverOpen] = useState(false);
  let [updateComparison, { loading, data }] = useMutation<
    UpdateComparison,
    UpdateComparisonVariables
  >(UPDATE_COMPARISON, {
    onError: () => {},
  });

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

  useEffect(() => {
    if (data?.updateComparison.tableId) {
      onTableIdChange && onTableIdChange(data.updateComparison.tableId);
    }
  }, [data, onTableIdChange]);

  return (
    <Container>
      <Row>
        <Title noData={noData}>{title}</Title>
        {showSubtitle && (
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
              <Touchable
                onPress={() => {
                  updateComparison({
                    variables: {
                      actionType: CompareActionType.DELETE_ALL,
                      tableId,
                      reviewTag,
                    },
                  });
                }}
              >
                <SvgRoundClose />
              </Touchable>
            </>
          )
        ) : null}
        {canCompare && (
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
