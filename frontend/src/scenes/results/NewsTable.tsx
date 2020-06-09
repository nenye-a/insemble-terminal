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

type MergedNewsData = (NewsData | NewsCompareData) & {
  isComparison: boolean;
};

export default function NewsTable(props: Props) {
  let { data, compareData = [] } = props;
  let mergedData = [
    ...data.map((item) => ({ ...item, isComparison: false })),
    ...compareData?.map((item) => ({ ...item, isComparison: true })),
  ];

  let { sortedData, requestSort, sortConfig } = useSortableData<MergedNewsData>(
    mergedData,
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
      {sortedData.map((row, index) => {
        let {
          title = '',
          link = '',
          source = '',
          published,
          isComparison,
        } = row;
        return (
          <DataTable.Row
            key={index}
            onPress={() => {
              window.open(link, '_blank');
            }}
            {...(isComparison && {
              style: { backgroundColor: TABLE_PURPLE_BACKGROUND },
            })}
          >
            <DataTable.Cell
              width={500}
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {title}
            </DataTable.Cell>
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
