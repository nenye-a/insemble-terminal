import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
import { TABLE_PURPLE_BACKGROUND, THEME_COLOR } from '../../constants/colors';
import { useSortableData } from '../../helpers';
import { Direction } from '../../types/types';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';
import SvgRoundAdd from '../../components/icons/round-add';

type Props = {
  data: Array<PerformanceTableData>;
  compareData?: Array<PerformanceTableCompareData>;
  showNumLocation?: boolean;
  headerTitle?: string;
};

type MergedPerformanceTableData = (
  | PerformanceTableData
  | PerformanceTableCompareData
) & {
  isComparison: boolean;
};

export default function PerformanceTable(props: Props) {
  let {
    data,
    compareData = [],
    showNumLocation = true,
    headerTitle = 'Company',
  } = props;
  let mergedData = [
    ...data.map((item) => ({ ...item, isComparison: false })),
    ...compareData?.map((item) => ({ ...item, isComparison: true })),
  ];
  let { sortedData, requestSort, sortConfig } = useSortableData<
    MergedPerformanceTableData
  >(mergedData, {
    key: 'totalSales',
    direction: Direction.DESCENDING,
  });

  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell>{headerTitle}</DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={200}
          align="right"
          onClick={() => {
            requestSort('totalSales');
          }}
          sortConfig={sortConfig}
          name="totalSales"
          infoboxContent={
            <View>
              <PopoverTitle>Ratings</PopoverTitle>
              <Text>
                The customer volume index represents the volume of customers
                that this company or category sees, over the last three months.
              </Text>
              <Text
                style={{
                  marginTop: 30,
                }}
              >
                Use the
                <SvgRoundAdd
                  width={18}
                  height={18}
                  style={{ marginLeft: 8, marginRight: 8, marginBottom: -4 }}
                />
                to compare against brand performance, location performance, or
                industry performance.
              </Text>
            </View>
          }
        >
          Customer Volume Index
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={120}
          align="right"
          onClick={() => {
            requestSort('avgRating');
          }}
          sortConfig={sortConfig}
          name="avgRating"
          infoboxContent={
            <View>
              <PopoverTitle>Ratings</PopoverTitle>
              <Text>
                A composite rating of scores from multiple online review
                sources.
              </Text>
            </View>
          }
        >
          Avg rating
        </DataTable.HeaderCell>
        <DataTable.HeaderCell
          width={150}
          align="right"
          onClick={() => {
            requestSort('numReview');
          }}
          sortConfig={sortConfig}
          name="numReview"
        >
          Avg # of reviews
        </DataTable.HeaderCell>
        {showNumLocation && (
          <DataTable.HeaderCell width={120} align="right">
            # Locations
          </DataTable.HeaderCell>
        )}
      </DataTable.HeaderRow>
      {sortedData.map((row, index) => {
        let {
          name = '',
          avgRating = '',
          numLocation = 'N/A',
          numReview = '',
          totalSales = '',
          isComparison,
        } = row;
        return (
          <DataTable.Row
            key={index}
            {...(isComparison && {
              style: { backgroundColor: TABLE_PURPLE_BACKGROUND },
            })}
          >
            <DataTable.Cell>{name}</DataTable.Cell>
            <DataTable.Cell width={200} align="right">
              {totalSales}
            </DataTable.Cell>
            <DataTable.Cell width={120} align="right">
              {avgRating}
            </DataTable.Cell>
            <DataTable.Cell width={150} align="right">
              {numReview}
            </DataTable.Cell>
            {showNumLocation && (
              <DataTable.Cell width={120} align="right">
                {numLocation}
              </DataTable.Cell>
            )}
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}

const PopoverTitle = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  margin-bottom: 12px;
`;
