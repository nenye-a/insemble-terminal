import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { View, Text, Card } from '../../core-ui';
import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_table_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
import {
  useSortableData,
  lightenOrDarkenColor,
  getTextColor,
} from '../../helpers';
import { Direction } from '../../types/types';
import { WHITE, THEME_COLOR } from '../../constants/colors';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';

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
};

export default function PerformanceTable(props: Props) {
  let { data, showNumLocation = true, headerTitle = 'Company' } = props;
  let [infoboxVisible, setInfoboxVisible] = useState(false);

  let { sortedData, requestSort, sortConfig } = useSortableData<
    MergedPerformanceTableData
  >(data, {
    key: 'customerVolumeIndex',
    direction: Direction.DESCENDING,
  });

  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell>{headerTitle}</DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={90}
          align="right"
          onClick={() => {
            requestSort('customerVolumeIndex');
          }}
          sortConfig={sortConfig}
          name="customerVolumeIndex"
        >
          Volume IDX
        </DataTable.HeaderCell>
        {/* TODO: change data */}
        <DataTable.HeaderCell
          width={90}
          align="right"
          onClick={() => {
            requestSort('localRetailIndex');
          }}
          sortConfig={sortConfig}
          name="localRetailIndex"
        >
          Retail IDX
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={100}
          align="right"
          onClick={() => {
            requestSort('localCategoryIndex');
          }}
          sortConfig={sortConfig}
          name="localCategoryIndex"
        >
          Category IDX
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={90}
          align="right"
          onClick={() => {
            requestSort('nationalIndex');
          }}
          sortConfig={sortConfig}
          name="nationalIndex"
        >
          Brand IDX
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={90}
          align="right"
          onClick={() => {
            requestSort('avgRating');
          }}
          sortConfig={sortConfig}
          name="avgRating"
        >
          Rating
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={90}
          align="right"
          onClick={() => {
            requestSort('numReview');
          }}
          sortConfig={sortConfig}
          name="numReview"
        >
          # Reviews
        </DataTable.HeaderCell>
        {showNumLocation && (
          <DataTable.HeaderCell
            width={90}
            align="right"
            onClick={() => {
              requestSort('numLocation');
            }}
            sortConfig={sortConfig}
            name="numLocation"
          >
            # Locations
          </DataTable.HeaderCell>
        )}
      </DataTable.HeaderRow>
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
          } = row;
          let bgColor = fill ? lightenOrDarkenColor(fill, 25) : WHITE;
          let textColor = getTextColor(bgColor);
          let tableRow = (
            <DataTable.Row
              key={index}
              style={{
                backgroundColor: bgColor,
              }}
            >
              <DataTable.Cell style={{ color: textColor }}>
                {hasAsterisk ? `${name}*` : name}
              </DataTable.Cell>
              <DataTable.Cell
                width={90}
                align="right"
                style={{ color: textColor }}
              >
                {customerVolumeIndex || '-'}
              </DataTable.Cell>
              <DataTable.Cell
                width={90}
                align="right"
                style={{ color: textColor }}
              >
                {formatNullData(localRetailIndex)}
              </DataTable.Cell>
              <DataTable.Cell
                width={100}
                align="right"
                style={{ color: textColor }}
              >
                {formatNullData(localCategoryIndex)}
              </DataTable.Cell>
              <DataTable.Cell
                width={90}
                align="right"
                style={{ color: textColor }}
              >
                {formatNullData(nationalIndex)}
              </DataTable.Cell>
              <DataTable.Cell
                width={90}
                align="right"
                style={{ color: textColor }}
              >
                {formatNullData(avgRating)}
              </DataTable.Cell>
              <DataTable.Cell
                width={90}
                align="right"
                style={{ color: textColor }}
              >
                {formatNullData(numReview)}
              </DataTable.Cell>
              {showNumLocation && (
                <DataTable.Cell
                  width={90}
                  align="right"
                  style={{ color: textColor }}
                >
                  {formatNullData(numLocation)}
                </DataTable.Cell>
              )}
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
