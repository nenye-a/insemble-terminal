import React from 'react';

import { DataTable } from '../../components';
import {
  GetNewsTable_newsTable_data as NewsData,
  GetNewsTable_newsTable_compareData as NewsCompareData,
} from '../../generated/GetNewsTable';
import { TABLE_PURPLE_BACKGROUND } from '../../constants/colors';
import { getPublishedDate, useSortableData } from '../../helpers';
import { Direction } from '../../types/types';

type Props = {
  data: Array<NewsData>;
  compareData?: Array<NewsCompareData>;
};

export default function NewsTable(props: Props) {
  let { data, compareData } = props;

  let { sortedData, requestSort, sortConfig } = useSortableData<NewsData>(
    data,
    {
      key: 'published',
      direction: Direction.DESCENDING,
      type: 'date',
    },
  );

  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={500}>Top News</DataTable.HeaderCell>
        <DataTable.HeaderCell>Source</DataTable.HeaderCell>
        <DataTable.HeaderCell
          align="right"
          onClick={() => {
            requestSort('published', 'date');
          }}
          name="published"
          sortConfig={sortConfig}
        >
          Post Date
        </DataTable.HeaderCell>
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
              <DataTable.Cell align="right">
                {getPublishedDate(published)}
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      {sortedData.map((row, index) => {
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
            <DataTable.Cell align="right">
              {getPublishedDate(published)}
            </DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
