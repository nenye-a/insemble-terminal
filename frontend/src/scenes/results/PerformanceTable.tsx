import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { View, Text, Card, TouchableOpacity } from '../../core-ui';
import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_table_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
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
} from '../../types/types';
import { WHITE, THEME_COLOR, GRAY_TEXT } from '../../constants/colors';
import { FONT_WEIGHT_BOLD, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import {
  PerformanceTableType,
  LocationTagType,
  BusinessType,
} from '../../generated/globalTypes';
import SvgArrowLeft from '../../components/icons/arrow-left';
import SvgArrowRight from '../../components/icons/arrow-right';

type MergedPerformanceTableData = (
  | PerformanceTableData
  | PerformanceTableCompareData
) & {
  isComparison: boolean;
  fill?: string;
  hasAsterisk: boolean;
};

type Props = {
  data: Array<MergedPerformanceTableData>;
  compareData?: Array<PerformanceTableCompareData>;
  showNumLocation?: boolean;
  headerTitle?: string;
  onPerformanceRowPress?: (param: PerformanceRowPressParam) => void;
  mobile?: boolean;
  performanceType: PerformanceTableType;
  businessTag?: {
    type: BusinessType;
    params: string;
  };
  locationTag?: { type: LocationTagType; params: string };
  inTerminal?: boolean;
  comparisonTags?: Array<ComparationTagWithFill>;
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
    inTerminal,
    comparisonTags,
  } = props;
  let [infoboxVisible, setInfoboxVisible] = useState(false);
  let [headerIndex, setHeaderIndex] = useState(0);

  let { sortedData, requestSort, sortConfig } = useSortableData<
    MergedPerformanceTableData
  >(data, {
    key: 'customerVolumeIndex',
    direction: Direction.DESCENDING,
  });

  let headerCells = [
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="right"
      onClick={() => {
        requestSort('customerVolumeIndex');
      }}
      sortConfig={sortConfig}
      name="customerVolumeIndex"
      key={0}
    >
      Volume IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="right"
      onClick={() => {
        requestSort('localRetailIndex');
      }}
      sortConfig={sortConfig}
      name="localRetailIndex"
      key={1}
    >
      Retail IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="right"
      onClick={() => {
        requestSort('localCategoryIndex');
      }}
      sortConfig={sortConfig}
      name="localCategoryIndex"
      key={2}
    >
      Category IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 100}
      align="right"
      onClick={() => {
        requestSort('nationalIndex');
      }}
      sortConfig={sortConfig}
      name="nationalIndex"
      key={3}
    >
      Brand IDX
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="right"
      onClick={() => {
        requestSort('avgRating');
      }}
      sortConfig={sortConfig}
      name="avgRating"
      key={4}
    >
      Rating
    </DataTable.HeaderCell>,
    <DataTable.HeaderCell
      width={mobile ? 120 : 90}
      align="right"
      onClick={() => {
        requestSort('numReview');
      }}
      sortConfig={sortConfig}
      name="numReview"
      key={5}
    >
      # Reviews
    </DataTable.HeaderCell>,
  ];
  showNumLocation &&
    headerCells.push(
      <DataTable.HeaderCell
        width={mobile ? 120 : 90}
        align="right"
        onClick={() => {
          requestSort('numLocation');
        }}
        sortConfig={sortConfig}
        name="numLocation"
        key={6}
      >
        # Locations
      </DataTable.HeaderCell>,
    );
  let firstIndex = headerIndex === 0;
  let lastIndex = headerIndex === headerCells.length - 1;
  return (
    <DataTable>
      {mobile ? (
        <DataTable.HeaderRow>
          <DataTable.HeaderCell>{headerTitle}</DataTable.HeaderCell>
          <Navigator
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
          </Navigator>
          {headerCells[headerIndex]}
          <Navigator
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
          </Navigator>
        </DataTable.HeaderRow>
      ) : (
        <DataTable.HeaderRow>
          <DataTable.HeaderCell>{headerTitle}</DataTable.HeaderCell>
          {headerCells}
        </DataTable.HeaderRow>
      )}

      <DataTable.Body>
        {sortedData.map((row, index) => {
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
          } = row;
          let bgColor = fill ? lightenOrDarkenColor(fill, 25) : WHITE;
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
              {isNull(localCategoryIndex)
                ? '-'
                : Number(localCategoryIndex) / 100}
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
              key={index}
              style={{
                backgroundColor: bgColor,
              }}
              onPress={() => {
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
                if (onPerformanceRowPress) {
                  let newSearchTag = getPerformanceNewSearchTag(
                    performanceType,
                  );
                  if (Object.keys(newSearchTag).length > 0) {
                    if (inTerminal) {
                      onPerformanceRowPress({
                        newTag: { name, ...newSearchTag },
                        prevTag: {
                          locationTag,
                          businessTag,
                        },
                        ...(isComparison && {
                          comparisonTag: comparePrevTag,
                        }),
                      });
                    } else {
                      onPerformanceRowPress({
                        newTag: {
                          name,
                          ...newSearchTag,
                        },
                        comparisonTag: comparePrevTag,
                        ...(isComparison && {
                          comparisonTag: comparePrevTag,
                        }),
                      });
                    }
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
        })}
      </DataTable.Body>
    </DataTable>
  );
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
  color: ${GRAY_TEXT};
`;

const Navigator = styled(TouchableOpacity)`
  margin: 0 4px;
`;
