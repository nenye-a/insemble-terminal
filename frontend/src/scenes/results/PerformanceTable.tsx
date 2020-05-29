import React from 'react';

import { DataTable } from '../../components';
import {
  GetPerformanceTable_performanceTable_data as PerformanceTableData,
  GetPerformanceTable_performanceTable_compareData as PerformanceTableCompareData,
} from '../../generated/GetPerformanceTable';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';

type Props = {
  data: Array<PerformanceTableData>;
  compareData?: Array<PerformanceTableCompareData>;
  showNumLocation?: boolean;
  headerTitle?: string;
};

export default function PerformanceTable(props: Props) {
  let {
    data,
    compareData,
    showNumLocation = true,
    headerTitle = 'Company',
  } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={260}>{headerTitle}</DataTable.HeaderCell>
        <DataTable.HeaderCell width={180} align="right">
          Sales volume index ▲
        </DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">Avg rating</DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">
          Avg # of reviews
        </DataTable.HeaderCell>
        {showNumLocation && (
          <DataTable.HeaderCell width={120} align="right">
            # Locations
          </DataTable.HeaderCell>
        )}
      </DataTable.HeaderRow>
      {compareData &&
        compareData.map((row, index) => {
          let {
            name = '',
            avgRating = '',
            numLocation = 'N/A',
            numReview = '',
            totalSales = '',
          } = row;
          return (
            <DataTable.Row
              key={'compare' + index}
              style={{ backgroundColor: TABLE_PURPLE_BACKGROUND }}
            >
              <DataTable.Cell width={260}>{name}</DataTable.Cell>
              <DataTable.Cell width={180} align="right">
                {totalSales}
              </DataTable.Cell>
              <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
              <DataTable.Cell align="right">{numReview}</DataTable.Cell>
              {showNumLocation && (
                <DataTable.Cell width={120} align="right">
                  {numLocation}
                </DataTable.Cell>
              )}
            </DataTable.Row>
          );
        })}
      {data.map((row, index) => {
        let {
          name = '',
          avgRating = '',
          numLocation = 'N/A',
          numReview = '',
          totalSales = '',
        } = row;
        return (
          <DataTable.Row key={index}>
            <DataTable.Cell width={260}>{name}</DataTable.Cell>
            <DataTable.Cell width={180} align="right">
              {totalSales}
            </DataTable.Cell>
            <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
            <DataTable.Cell align="right">{numReview}</DataTable.Cell>
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
