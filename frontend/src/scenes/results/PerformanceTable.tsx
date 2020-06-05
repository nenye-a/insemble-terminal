import React from 'react';

import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';
import { useSortableData } from '../../helpers';
import { Direction } from '../../types/types';

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
