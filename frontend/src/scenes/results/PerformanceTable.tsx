import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { View, Text, Card, TouchableOpacity, Button } from '../../core-ui';
import { DataTable } from '../../components';
import {
  useSortableData,
  lightenOrDarkenColor,
  getTextColor,
  getPerformanceNewSearchTag,
} from '../../helpers';
import {
  Direction,
  PerformanceRowPressParam,
  ComparationTagWithFill,
  MergedPerformanceData,
} from '../../types/types';
import {
  WHITE,
  THEME_COLOR,
  GRAY_TEXT,
  SLIGHT_GRAY,
} from '../../constants/colors';
import { FONT_WEIGHT_BOLD, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import {
  PerformanceTableType,
  LocationTagType,
  BusinessType,
  BusinessTagType,
} from '../../generated/globalTypes';
import SvgArrowLeft from '../../components/icons/arrow-left';
import SvgArrowRight from '../../components/icons/arrow-right';
import SvgChart from '../../components/icons/chart';

type Props = {
  data: Array<MergedPerformanceData>;
  showNumLocation?: boolean;
  headerTitle?: string;
  onPerformanceRowPress?: (param: PerformanceRowPressParam) => void;
  mobile?: boolean;
  performanceType: PerformanceTableType;
  businessTag?: {
    type: BusinessType;
    params: string;
    id: string;
  };
  locationTag?: { type: LocationTagType; params: string };
  comparisonTags?: Array<ComparationTagWithFill>;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  disableHeader?: boolean;
};

export default function PerformanceTable(props: Props) {
  let {
    data,
    showNumLocation = true,
    headerTitle = 'Company',
    onPerformanceRowPress,
    performanceType,
    mobile = false,
    businessTag,
    locationTag,
    comparisonTags,
    onViewModeChange,
    disableHeader,
  } = props;
  let [headerIndex, setHeaderIndex] = useState(0);

  let { sortedData, requestSort, sortConfig } = useSortableData<
    MergedPerformanceData
  >(data, {
    key: 'customerVolumeIndex',
    direction: Direction.DESCENDING,
  });
  let firstColumnHeader = (
    <Row>
      {headerTitle}
      <GraphButton
        text="Graph"
        iconPlacement="start"
        mode="secondary"
        size="small"
        disabled={!onViewModeChange}
        icon={
          <SvgChart
            style={{
              color: disableHeader ? SLIGHT_GRAY : THEME_COLOR,
              marginRight: 8,
            }}
          />
        }
        onPress={() => onViewModeChange && onViewModeChange('graph')}
        textProps={{
          style: {
            color: disableHeader ? SLIGHT_GRAY : THEME_COLOR,
          },
        }}
      />
    </Row>
  );
  let headerCells = [
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="center"
      onClick={() => {
        requestSort('customerVolumeIndex');
      }}
      sortConfig={sortConfig}
      name="customerVolumeIndex"
      key={0}
      disabled={disableHeader}
    >
      Volume IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="center"
      onClick={() => {
        requestSort('localRetailIndex');
      }}
      sortConfig={sortConfig}
      name="localRetailIndex"
      key={1}
      disabled={disableHeader}
    >
      Retail IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="center"
      onClick={() => {
        requestSort('localCategoryIndex');
      }}
      sortConfig={sortConfig}
      name="localCategoryIndex"
      key={2}
      disabled={disableHeader}
    >
      Category IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 100}
      align="center"
      onClick={() => {
        requestSort('nationalIndex');
      }}
      sortConfig={sortConfig}
      name="nationalIndex"
      key={3}
      disabled={disableHeader}
    >
      Brand IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="center"
      onClick={() => {
        requestSort('avgRating');
      }}
      sortConfig={sortConfig}
      name="avgRating"
      key={4}
      disabled={disableHeader}
    >
      Rating
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="center"
      onClick={() => {
        requestSort('numReview');
      }}
      sortConfig={sortConfig}
      name="numReview"
      key={5}
      disabled={disableHeader}
    >
      # Reviews
    </DataTable.HeaderCell>,
  ];
  showNumLocation &&
    headerCells.push(
      <DataTable.HeaderCell
        width={mobile ? 120 : 90}
        align="center"
        onClick={() => {
          requestSort('numLocation');
        }}
        sortConfig={sortConfig}
        name="numLocation"
        key={6}
        disabled={disableHeader}
      >
        # Locations
      </DataTable.HeaderCell>,
    );
  let firstIndex = headerIndex === 0;
  let lastIndex = headerIndex === headerCells.length - 1;
  return (
    <DataTable>
      {mobile ? (
        <DataTable.HeaderRow
          {...(disableHeader && { style: { backgroundColor: SLIGHT_GRAY } })}
        >
          <DataTable.HeaderCell>{firstColumnHeader}</DataTable.HeaderCell>
          <TouchableOpacity
            onPress={() => {
              setHeaderIndex(headerIndex - 1);
            }}
            disabled={firstIndex}
          >
            <SvgArrowLeft
              width={14}
              height={14}
              style={{ color: firstIndex ? GRAY_TEXT : WHITE }}
            />
          </TouchableOpacity>
          {headerCells[headerIndex]}
          <Next
            onPress={() => {
              setHeaderIndex(headerIndex + 1);
            }}
            disabled={lastIndex}
          >
            <SvgArrowRight
              width={14}
              height={14}
              style={{ color: lastIndex ? GRAY_TEXT : WHITE }}
            />
          </Next>
        </DataTable.HeaderRow>
      ) : (
        <DataTable.HeaderRow
          {...(disableHeader && { style: { backgroundColor: SLIGHT_GRAY } })}
        >
          <DataTable.HeaderCell>{firstColumnHeader}</DataTable.HeaderCell>
          {headerCells}
        </DataTable.HeaderRow>
      )}

      <DataTable.Body>
        {sortedData.map((row, index) => {
          return (
            <TableRow
              datum={row}
              mobile={mobile}
              key={index}
              showNumLocation={showNumLocation}
              businessTag={businessTag}
              locationTag={locationTag}
              comparisonTags={comparisonTags}
              onPerformanceRowPress={onPerformanceRowPress}
              performanceType={performanceType}
              headerIndex={headerIndex}
            />
          );
        })}
      </DataTable.Body>
    </DataTable>
  );
}

type TableRowProps = {
  datum: MergedPerformanceData;
  mobile: boolean;
  businessTag?: {
    type: BusinessType;
    params: string;
    id: string;
  };
  locationTag?: { type: LocationTagType; params: string };
  comparisonTags?: Array<ComparationTagWithFill>;
  showNumLocation: boolean;
  onPerformanceRowPress?: (param: PerformanceRowPressParam) => void;
  performanceType: PerformanceTableType;
  headerIndex: number;
};

function TableRow(props: TableRowProps) {
  let [infoboxVisible, setInfoboxVisible] = useState(false);
  let {
    datum,
    mobile,
    locationTag,
    comparisonTags,
    showNumLocation,
    onPerformanceRowPress,
    performanceType,
    headerIndex,
  } = props;

  let {
    name = '-',
    avgRating = '-',
    numLocation = '-',
    numReview = '-',
    customerVolumeIndex = '-',
    localCategoryIndex = '-',
    localRetailIndex = '-',
    nationalIndex = '-',
    hasAsterisk,
    fill,
    isComparison,
  } = datum;
  let bgColor = fill
    ? lightenOrDarkenColor(fill, 25)
    : lightenOrDarkenColor(THEME_COLOR, 25);
  let textColor = getTextColor(bgColor);
  let tableCells = [
    <DataTable.Cell
      width={mobile ? 120 : 90}
      align="right"
      style={{ color: textColor }}
      key={0}
    >
      {customerVolumeIndex ? Number(customerVolumeIndex) / 100 : '-'}
      {!!customerVolumeIndex && <Times>x</Times>}
    </DataTable.Cell>,
    <DataTable.Cell
      width={mobile ? 120 : 90}
      align="right"
      style={{ color: textColor }}
      key={1}
    >
      {isNull(localRetailIndex) ? '-' : Number(localRetailIndex) / 100}
      {!isNull(localRetailIndex) && <Times>x</Times>}
    </DataTable.Cell>,
    <DataTable.Cell
      width={mobile ? 120 : 100}
      align="right"
      style={{ color: textColor }}
      key={2}
    >
      {isNull(localCategoryIndex) ? '-' : Number(localCategoryIndex) / 100}
      {!isNull(localCategoryIndex) && <Times>x</Times>}
    </DataTable.Cell>,
    <DataTable.Cell
      width={mobile ? 120 : 90}
      align="right"
      style={{ color: textColor }}
      key={3}
    >
      {isNull(nationalIndex) ? '-' : Number(nationalIndex) / 100}
      {!isNull(nationalIndex) && <Times>x</Times>}
    </DataTable.Cell>,
    <DataTable.Cell
      width={mobile ? 120 : 90}
      align="right"
      style={{ color: textColor }}
      key={4}
    >
      {formatNullData(avgRating)}
    </DataTable.Cell>,
    <DataTable.Cell
      width={mobile ? 120 : 90}
      align="right"
      style={{ color: textColor }}
      key={5}
    >
      {formatNullData(numReview)}
    </DataTable.Cell>,
    showNumLocation && (
      <DataTable.Cell
        width={mobile ? 120 : 90}
        align="right"
        style={{ color: textColor }}
        key={6}
      >
        {formatNullData(numLocation)}
      </DataTable.Cell>
    ),
  ];
  let tableRow = (
    <DataTable.Row
      style={{
        backgroundColor: bgColor,
      }}
      onPress={() => {
        if (onPerformanceRowPress) {
          let comparePrevTag;
          if (isComparison && comparisonTags) {
            let compareLocationAndBusinessTag = comparisonTags.find(
              (tag) => tag.fill === fill,
            );
            if (compareLocationAndBusinessTag) {
              let {
                businessTag: compareBusinessTag,
                locationTag: compareLocationTag,
              } = compareLocationAndBusinessTag;
              comparePrevTag = {
                businessTag: compareBusinessTag,
                locationTag: compareLocationTag,
              };
            }
          }

          let newSearchTag = getPerformanceNewSearchTag(performanceType);
          if (Object.keys(newSearchTag).length > 0) {
            let parenthesesRegex = /\([^(]+\)$/g;
            let insideParenthesesTextRegex = /\(([^)]+)\)/;
            let nameWithoutParentheses = name.replace(parenthesesRegex, '');

            let params: PerformanceRowPressParam = {};
            if (
              performanceType === PerformanceTableType.BRAND ||
              performanceType === PerformanceTableType.CATEGORY
            ) {
              params = {
                businessTag: newSearchTag.businessType
                  ? {
                      params: nameWithoutParentheses,
                      type: newSearchTag.businessType,
                    }
                  : undefined,
                locationTag: isComparison
                  ? comparePrevTag?.locationTag ?? undefined
                  : locationTag,
              };
            } else if (performanceType !== PerformanceTableType.OVERALL) {
              let matchArr = name.match(insideParenthesesTextRegex);
              let stringInsideParentheses =
                matchArr && matchArr.length > 1 ? matchArr[1] : '';

              params = {
                businessTag: {
                  type: BusinessTagType.BUSINESS,
                  params: stringInsideParentheses,
                },
                locationTag: newSearchTag.locationType
                  ? {
                      params: nameWithoutParentheses,
                      type: newSearchTag.locationType,
                    }
                  : undefined,
              };
            }
            onPerformanceRowPress({
              ...params,
            });
          }
        }
      }}
    >
      <DataTable.Cell style={{ color: textColor }}>
        {hasAsterisk ? `${name}*` : name}
      </DataTable.Cell>
      {mobile ? tableCells[headerIndex] : tableCells}
    </DataTable.Row>
  );
  if (hasAsterisk) {
    return (
      <Popover
        isOpen={infoboxVisible}
        content={ConfidencePopover}
        position={['bottom']}
        onClickOutside={() => setInfoboxVisible(false)}
        align="start"
        padding={-5}
      >
        {(ref) => (
          <View
            ref={ref}
            onMouseEnter={() => {
              setInfoboxVisible(true);
            }}
            onMouseLeave={() => {
              setInfoboxVisible(false);
            }}
          >
            {tableRow}
          </View>
        )}
      </Popover>
    );
  }

  return tableRow;
}

function formatNullData(value: string | number | null) {
  if (value == null) {
    return '-';
  }
  return value;
}

function isNull(value: string | number | null) {
  return value == null;
}

function ConfidencePopover() {
  return (
    <PopoverContainer>
      <PopoverTitle>Higher Potential Interference:</PopoverTitle>
      <Text>
        This business appears to be in a busy shopping area, in which
        surrounding store interference may cause variation in the data
      </Text>
    </PopoverContainer>
  );
}

const PopoverContainer = styled(Card)`
  padding: 12px;
  max-width: 400px;
`;

const PopoverTitle = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  margin-bottom: 12px;
`;

const Times = styled(Text)`
  padding-left: 2px;
  font-weight: ${FONT_WEIGHT_MEDIUM};
  color: inherit;
`;

const Next = styled(TouchableOpacity)`
  margin-right: 18px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const GraphButton = styled(Button)`
  padding: 2px 5px;
  margin-left: 8px;
  height: 20px;
  border-width: 0px;
`;
