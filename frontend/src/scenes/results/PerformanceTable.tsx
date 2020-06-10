import React from 'react';

import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';
import { useSortableData } from '../../helpers';
import { Direction } from '../../types/types';

type MergedPerformanceTableData = (
  | PerformanceTableData
  | PerformanceTableCompareData
) & {
  isComparison: boolean;
  fill?: string;
};

type Props = {
  data: Array<MergedPerformanceTableData>;
  compareData?: Array<PerformanceTableCompareData>;
  showNumLocation?: boolean;
  headerTitle?: string;
};

export default function PerformanceTable(props: Props) {
  let { data, showNumLocation = true, headerTitle = 'Company' } = props;

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
          <DataTable.HeaderCell width={90} align="right">
            # Locations
          </DataTable.HeaderCell>
        )}
      </DataTable.HeaderRow>
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
          isComparison,
          fill,
        } = row;

        return (
          <DataTable.Row
            key={index}
            {...(isComparison && {
              style: { backgroundColor: fill },
            })}
          >
            <DataTable.Cell>{name}</DataTable.Cell>
            <DataTable.Cell width={90} align="right">
              {formatNullData(customerVolumeIndex)}
            </DataTable.Cell>
            <DataTable.Cell width={90} align="right">
              {formatNullData(localRetailIndex)}
            </DataTable.Cell>
            <DataTable.Cell width={100} align="right">
              {formatNullData(localCategoryIndex)}
            </DataTable.Cell>
            <DataTable.Cell width={90} align="right">
              {formatNullData(nationalIndex)}
            </DataTable.Cell>
            <DataTable.Cell width={90} align="right">
              {formatNullData(avgRating)}
            </DataTable.Cell>
            <DataTable.Cell width={90} align="right">
              {formatNullData(numReview)}
            </DataTable.Cell>
            {showNumLocation && (
              <DataTable.Cell width={90} align="right">
                {formatNullData(numLocation)}
              </DataTable.Cell>
            )}
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}

function formatNullData(value: string | number | null) {
  if (value == null) {
    return '-';
  }
  return value;
}
