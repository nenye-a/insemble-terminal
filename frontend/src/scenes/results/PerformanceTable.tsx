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
};

export default function PerformanceTable(props: Props) {
  let { data, compareData, showNumLocation = true } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={220}>Company</DataTable.HeaderCell>
        <DataTable.HeaderCell>Sales volume index</DataTable.HeaderCell>
        <DataTable.HeaderCell>Avg rating</DataTable.HeaderCell>
        <DataTable.HeaderCell>Avg # of reviews</DataTable.HeaderCell>
        {showNumLocation && (
          <DataTable.HeaderCell># Locations</DataTable.HeaderCell>
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
              <DataTable.Cell width={220}>{name}</DataTable.Cell>
              <DataTable.Cell align="right">{totalSales}</DataTable.Cell>
              <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
              <DataTable.Cell align="right">{numReview}</DataTable.Cell>
              {showNumLocation && (
                <DataTable.Cell align="right">{numLocation}</DataTable.Cell>
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
            <DataTable.Cell width={220}>{name}</DataTable.Cell>
            <DataTable.Cell align="right">{totalSales}</DataTable.Cell>
            <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
            <DataTable.Cell align="right">{numReview}</DataTable.Cell>
            {showNumLocation && (
              <DataTable.Cell align="right">{numLocation}</DataTable.Cell>
            )}
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
