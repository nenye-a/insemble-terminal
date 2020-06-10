import React from 'react';

import { DataTable } from '../../components';
import { getPublishedDate, useSortableData } from '../../helpers';
import { Direction, MergedNewsData } from '../../types/types';

type Props = {
  data: Array<MergedNewsData>;
};

export default function NewsTable(props: Props) {
  let { data } = props;

  let { sortedData, requestSort, sortConfig } = useSortableData<MergedNewsData>(
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
      {sortedData.map((row, index) => {
        let { title = '', link = '', source = '', published, fill } = row;
        return (
          <DataTable.Row
            key={index}
            onPress={() => {
              window.open(link, '_blank');
            }}
            style={{ backgroundColor: fill || undefined }}
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
