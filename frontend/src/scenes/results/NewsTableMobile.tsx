import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Text, View } from '../../core-ui';
import { DataTable } from '../../components';
import {
  getPublishedDate,
  useSortableData,
  lightenOrDarkenColor,
  getTextColor,
} from '../../helpers';
import { Direction, MergedNewsData } from '../../types/types';
import { WHITE, GRAY_TEXT } from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';

type Props = {
  data: Array<MergedNewsData>;
};

export default function NewsTableMobile(props: Props) {
  let { data } = props;
  let history = useHistory();

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
        <DataTable.HeaderCell width={500}>Latest News</DataTable.HeaderCell>
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
          let {
            id: idProp,
            title = '',
            link = '',
            source = '',
            published,
            fill,
          } = row;
          let bgColor = fill ? lightenOrDarkenColor(fill, 25) : WHITE;
          let textColor = getTextColor(bgColor);
          let id = idProp || index;

          return (
            <DataTable.Row
              key={index}
              onPress={() => {
                history.push(`/news/${id}`, {
                  title,
                  link,
                  source,
                  published,
                  background: history.location,
                });
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
                <View>
                  <SourceText>{title}</SourceText>
                  <Text fontWeight={FONT_WEIGHT_MEDIUM}>{source}</Text>
                </View>
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

const SourceText = styled(Text)`
  margin-bottom: 8px;
  color: ${GRAY_TEXT};
`;
