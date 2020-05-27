import React from 'react';

import { DataTable } from '../../components';
import { GetPerformanceTable_performanceTable_data as PerformanceTableData } from '../../generated/GetPerformanceTable';

type Props = {
  data: Array<PerformanceTableData>;
  showNumLocation?: boolean;
};

export default function PerformanceTable(props: Props) {
  let { data, showNumLocation = true } = props;
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
