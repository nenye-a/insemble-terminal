import React from 'react';

import { DataTable } from '../../components';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';

type Props = {
  data: Array<any>; // change to news data
  compareData?: Array<any>; // change to news data
};

export default function NewsTable(props: Props) {
  let { data, compareData } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={500}>Top News</DataTable.HeaderCell>
        <DataTable.HeaderCell>Source</DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">Post Date</DataTable.HeaderCell>
      </DataTable.HeaderRow>
      {compareData &&
        compareData.map((row, index) => {
          let { name = '', source = '', postDate = '' } = row;
          return (
            <DataTable.Row
              key={'compare-news' + index}
              style={{ backgroundColor: TABLE_PURPLE_BACKGROUND }}
            >
              <DataTable.Cell width={500}>{name}</DataTable.Cell>
              <DataTable.Cell>{source}</DataTable.Cell>
              <DataTable.Cell align="right">{postDate}</DataTable.Cell>
            </DataTable.Row>
          );
        })}
      {data.map((row, index) => {
        let { name = '', source = '', postDate = '' } = row;
        return (
          <DataTable.Row key={index}>
            <DataTable.Cell width={500}>{name}</DataTable.Cell>
            <DataTable.Cell>{source}</DataTable.Cell>
            <DataTable.Cell align="right">{postDate}</DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
