import React, { useState } from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';
import { useMutation } from '@apollo/react-hooks';
import { useLocation, useParams } from 'react-router-dom';
import { useAlert } from 'react-alert';
import { CSVLink } from 'react-csv';

import {
  View,
  Text,
  TouchableOpacity,
  LoadingIndicator,
  Card,
} from '../../core-ui';
import { PinPopover } from '../../components';
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
import { useAuth } from '../../context';
import { getResultTitle, useViewport } from '../../helpers';
import { ComparationTagWithFill, CSVHeader } from '../../types/types';
import {
  ReviewTag,
  LocationTagType,
  TableType,
  BusinessType,
} from '../../generated/globalTypes';
import {
  REMOVE_PINNED_TABLE,
  GET_TERMINAL,
  GET_TERMINAL_LIST,
} from '../../graphql/queries/server/terminals';
import {
  RemovePinnedTable,
  RemovePinnedTableVariables,
} from '../../generated/RemovePinnedTable';
import SvgPin from '../../components/icons/pin';
import SvgClose from '../../components/icons/close';
import SvgRoundAdd from '../../components/icons/round-add';
import SvgExportCsv from '../../components/icons/export-csv';
import InfoboxPopover from '../../components/InfoboxPopover';
import AddComparisonButton from '../../components/AddComparisonButton';
import TripleDotsButton from '../../components/TripleDotsButton';
import { MESSAGE } from '../../constants/message';

/**
 * title: result title
 * noData?: whether result has data or not
 * onTableIdChange?: callback executed to refetch result when getting new tableId
 * canCompare?: whether result can be compared or not
 * infoboxContent?: popover content which will be placed next to the result title
 * sortOrder?: comparison tag sorting rule
 * onSortOrderChange?: callback executed to reorder the sort rule
 * zoomIcon?: determine which icon should be zoomed. Use for demo purpose
 */

type Props = {
  title: string;
  noData?: boolean;
  reviewTag?: ReviewTag;
  tableId?: string;
  onTableIdChange?: (tableId: string) => void;
  comparisonTags?: Array<ComparationTagWithFill>;
  canCompare?: boolean;
  tableType?: TableType;
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
  demo?: boolean;
  onClosePress?: () => void;
  zoomIcon?: 'pin' | 'compare';
  canExport?: boolean;
  csvData?: Array<object>;
  csvHeader?: Array<CSVHeader>;
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
    onClosePress,
    demo,
    zoomIcon,
    csvData = [],
    csvHeader,
    canExport = true,
  } = props;
  let alert = useAlert();
  let isTerminalScene = location.pathname.includes('terminal');
  let [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  let [pinPopoverOpen, setPinPopoverOpen] = useState(false);
  let [infoPopoverOpen, setInfoPopoverOpen] = useState(false);
  let { isAuthenticated } = useAuth();
  let { isDesktop } = useViewport();

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

  let pinPopover =
    tableType && tableId ? (
      <PinPopover
        tableId={tableId}
        tableType={tableType}
        onClickAway={() => setPinPopoverOpen(false)}
      />
    ) : (
      <View />
    );

  let compareLocationText =
    comparisonTags &&
    comparisonTags.length > 0 &&
    comparisonTags[0].businessTag?.params
      ? comparisonTags.length === 1 && comparisonTags[0].locationTag
        ? comparisonTags[0].locationTag.type === LocationTagType.ADDRESS
          ? `near ${comparisonTags[0].locationTag.params}`
          : `in ${comparisonTags[0].locationTag.params}`
        : ''
      : '';

  let formattedCompareText =
    comparisonTags?.length === 1
      ? `Comparing with ${
          comparisonTags[0].businessTag?.params ||
          comparisonTags[0].locationTag?.params
        } ${compareLocationText}`
      : comparisonTags && comparisonTags?.length > 0
      ? `Comparing with ${comparisonTags.length} queries`
      : '';

  let resultTitle = getResultTitle({ reviewTag, businessTag, locationTag });
  let showAuthAlert = () => {
    alert.show(MESSAGE.LoginNeeded);
  };

  let showReadOnlyAlert = () => {
    alert.show(MESSAGE.ReadOnly);
  };

  let removePin = () => {
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
  };
  return (
    <Container
      // don't add padding horizontal if it's demo mode
      isDesktop={isDesktop || demo}
      {...(zoomIcon && { style: { alignItems: 'baseline' } })}
    >
      <Row flex>
        <Title noData={noData || !!zoomIcon}>{title}</Title>
        {infoboxContent && (
          <InfoboxPopover
            isOpen={infoPopoverOpen}
            onChange={setInfoPopoverOpen}
            content={() => (
              <PopoverContainer>
                {infoboxContent ? infoboxContent() : null}
              </PopoverContainer>
            )}
            disabled={noData || !!zoomIcon}
            isDesktop={isDesktop}
          />
        )}
        {isTerminalScene && !demo && resultTitle && (
          <>
            <Title style={{ paddingLeft: 8, paddingRight: 8 }}>|</Title>
            <SubTitle>{resultTitle}</SubTitle>
          </>
        )}
      </Row>
      <Row
        style={{
          minWidth: 100,
          justifyContent: 'flex-end',
        }}
        {...(zoomIcon && { style: { alignItems: 'flex-end' } })}
      >
        {isDesktop && formattedCompareText && !zoomIcon ? (
          <CompareText>{formattedCompareText}</CompareText>
        ) : null}
        {(isDesktop && !readOnly) || onClosePress || demo ? (
          <>
            {canCompare && reviewTag && tableId ? (
              <AddComparisonButton
                isOpen={comparisonPopoverOpen}
                onChange={setComparisonPopoverOpen}
                disabled={noData || zoomIcon === 'pin'}
                reviewTag={reviewTag}
                tableId={tableId}
                onTableIdChange={onTableIdChange}
                comparisonTags={comparisonTags}
                sortOrder={sortOrder}
                onSortOrderChange={onSortOrderChange}
                pinTableId={pinTableId}
                terminalId={params.terminalId}
                readOnly={readOnly}
                demo={demo}
              />
            ) : demo ? (
              <SvgRoundAdd
                fill={zoomIcon === 'pin' ? DISABLED_TEXT_COLOR : THEME_COLOR}
                {...(zoomIcon === 'compare' && {
                  width: 48,
                  height: 48,
                  style: { alignSelf: 'flex-end' },
                })}
              />
            ) : null}
            {((canExport && csvData) || demo) && (
              <CSVLink
                data={csvData}
                headers={csvHeader}
                filename={`${resultTitle}.csv`}
                style={{ cursor: noData || demo ? 'default' : 'pointer' }}
                onClick={() => {
                  if (demo || noData) {
                    return false;
                  }
                }}
              >
                <Touchable disabled={noData || demo}>
                  <SvgExportCsv
                    {...((!!zoomIcon || noData) && {
                      style: {
                        color: DISABLED_TEXT_COLOR,
                      },
                    })}
                  />
                </Touchable>
              </CSVLink>
            )}
            {isTerminalScene && !demo ? (
              removePinnedTableLoading ? (
                <LoadingIndicator />
              ) : (
                <Touchable
                  onPress={() => {
                    if (onClosePress) {
                      onClosePress();
                    } else {
                      removePin();
                    }
                  }}
                  disabled={noData || demo}
                  style={{ marginLeft: 8 }}
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
                    onPress={() => {
                      if (isAuthenticated) {
                        if (readOnly) {
                          showReadOnlyAlert();
                        } else {
                          setPinPopoverOpen(true);
                        }
                      } else {
                        showAuthAlert();
                      }
                    }}
                    disabled={noData || demo}
                  >
                    <SvgPin
                      {...((zoomIcon === 'compare' || noData) && {
                        fill: DISABLED_TEXT_COLOR,
                      })}
                      {...(zoomIcon === 'pin' && {
                        width: 48,
                        height: 48,
                        style: { alignSelf: 'flex-end' },
                      })}
                    />
                  </Touchable>
                )}
              </Popover>
            )}
          </>
        ) : !isDesktop && !readOnly && tableType ? (
          <TripleDotsButton
            disabled={noData}
            reviewTag={reviewTag}
            tableId={tableId}
            onTableIdChange={onTableIdChange}
            comparisonTags={comparisonTags}
            sortOrder={sortOrder}
            onSortOrderChange={onSortOrderChange}
            pinTableId={pinTableId}
            terminalId={params.terminalId}
            readOnly={readOnly}
            tableType={tableType}
            isTerminalScene={isTerminalScene}
            removePinFn={removePin}
            removePinLoading={removePinnedTableLoading}
            canCompare={canCompare}
            // csv props
            canExport={canExport}
            csvData={csvData}
            csvHeader={csvHeader}
            filename={resultTitle}
          />
        ) : null}
      </Row>
    </Container>
  );
}

type ContainerProps = ViewProps & {
  isDesktop: boolean;
};
type TitleProps = TextProps & {
  noData: boolean;
};

const Container = styled(View)<ContainerProps>`
  padding: ${({ isDesktop }) => (isDesktop ? `8px 0` : `4px 12px`)};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  flex: 1;
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
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  height: fit-content;
  max-width: 600px;
`;
