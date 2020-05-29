import React from 'react';

import { DataTable } from '../../components';
import {
  GetNewsTable_newsTable_data as NewsData,
  GetNewsTable_newsTable_compareData as NewsCompareData,
} from '../../generated/GetNewsTable';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';

type Props = {
  data: Array<NewsData>;
  compareData?: Array<NewsCompareData>;
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
          let { title = '', link = '', source = '', published } = row;
          return (
            <DataTable.Row
              key={'compare-news' + index}
              style={{ backgroundColor: TABLE_PURPLE_BACKGROUND }}
              onPress={() => {
                window.open(link, '_blank');
              }}
            >
              <DataTable.Cell width={500}>{title}</DataTable.Cell>
              <DataTable.Cell>{source}</DataTable.Cell>
              <DataTable.Cell align="right">{published}</DataTable.Cell>
            </DataTable.Row>
          );
        })}
      {data.map((row, index) => {
        let { title = '', link = '', source = '', published } = row;
        return (
          <DataTable.Row
            key={index}
            onPress={() => {
              window.open(link, '_blank');
            }}
          >
            <DataTable.Cell width={500}>{title}</DataTable.Cell>
            <DataTable.Cell>{source}</DataTable.Cell>
            <DataTable.Cell align="right">{published}</DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
