import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { DataTable } from '../../components';
import { WHITE, THEME_COLOR, LIGHT_PURPLE } from '../../constants/colors';
import { MergedMapData, Direction } from '../../types/types';
import { GetMap_mapTable_data_coverageData as MapBusiness } from '../../generated/GetMap';
import { useSortableData, useViewport, isEqual } from '../../helpers';

type Props = {
  data: Array<MergedMapData>;
  // to highlight pins of the selected/hovered row
  highlightFn: React.Dispatch<React.SetStateAction<MapBusiness | undefined>>;
};

export default function MapTable(props: Props) {
  let { data, highlightFn } = props;
  let [selectedRow, setSelectedRow] = useState<MapBusiness | null>(null);
  let allMapCoverageData: Array<MapBusiness> = [];
  data.forEach(({ coverageData }) => {
    allMapCoverageData = allMapCoverageData.concat(coverageData);
  });
  let { isDesktop } = useViewport();
  // Note: What we want to sort is the numlocations of data.coverageData
  let { sortedData, requestSort, sortConfig } = useSortableData<MapBusiness>(
    allMapCoverageData,
    {
      key: 'numLocations',
      direction: Direction.DESCENDING,
    },
  );

  return (
    <Container isDesktop={isDesktop}>
      <LegendContainer>
        {data.map(({ fill, name }, index) => (
          <Row key={`legend-${index}`}>
            <Circle style={{ backgroundColor: fill || THEME_COLOR }} />
            <LegendText>{name}</LegendText>
          </Row>
        ))}
      </LegendContainer>
      <DataTable flex>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell width={200}>Company</DataTable.HeaderCell>
          <DataTable.HeaderCell
            align="right"
            onClick={() => {
              requestSort('numLocations');
            }}
            sortConfig={sortConfig}
            name="numLocations"
          >
            Number Locations
          </DataTable.HeaderCell>
        </DataTable.HeaderRow>
        <DataTable.Body flex style={{ maxHeight: isDesktop ? 260 : 130 }}>
          {sortedData.map((row, index) => {
            let rowIsSelected = isEqual(row, selectedRow);
            return (
              <DataTable.Row
                key={'coverage-table-' + row.businessName + index}
                onMouseEnter={() => {
                  highlightFn(row);
                }}
                onMouseLeave={() => {
                  /**
                   * if there's still selectedRow, highlight back the pins of the row,
                   * else, leave the view as it is.
                   */
                  if (selectedRow) {
                    highlightFn(selectedRow);
                  }
                }}
                onPress={() => {
                  /**
                   * if the user pressed on the same row as the selected row then deselect the row
                   */
                  if (rowIsSelected) {
                    setSelectedRow(null);
                    highlightFn(undefined);
                  } else {
                    setSelectedRow(row);
                    highlightFn(row);
                  }
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: rowIsSelected ? LIGHT_PURPLE : WHITE,
                }}
              >
                <DataTable.Cell width={200}>{row.businessName}</DataTable.Cell>
                <DataTable.Cell align="right">
                  {row.numLocations}
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable.Body>
      </DataTable>
    </Container>
  );
}

const Container = styled(View)<ViewProps & WithViewport>`
  width: ${({ isDesktop }) => (isDesktop ? '410px' : '100%')};
  padding: 24px;
  background-color: ${WHITE};
`;

const LegendContainer = styled(View)`
  flex-flow: row wrap;
`;

const Circle = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin: 0 4px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  padding-bottom: 10px;
`;

const LegendText = styled(Text)`
  margin-right: 30px;
`;
