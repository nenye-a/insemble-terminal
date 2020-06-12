import React from 'react';

import { DataTable } from '../../components';
import {
  getPublishedDate,
  useSortableData,
  lightenOrDarkenColor,
  getTextColor,
} from '../../helpers';
import { Direction, MergedNewsData } from '../../types/types';
import { WHITE } from '../../constants/colors';

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
      <DataTable.Body>
        {sortedData.map((row, index) => {
          let { title = '', link = '', source = '', published, fill } = row;
          let bgColor = fill ? lightenOrDarkenColor(fill, 25) : WHITE;
          let textColor = getTextColor(bgColor);
          return (
            <DataTable.Row
              key={index}
              onPress={() => {
                window.open(link, '_blank');
              }}
              style={{
                backgroundColor: bgColor,
              }}
            >
              <DataTable.Cell
                width={500}
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  color: textColor,
                }}
              >
                {title}
              </DataTable.Cell>
              <DataTable.Cell style={{ color: textColor }}>
                {source}
              </DataTable.Cell>
              <DataTable.Cell style={{ color: textColor }} align="right">
                {getPublishedDate(published)}
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable.Body>
    </DataTable>
  );
}
