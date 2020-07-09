import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { DataTable } from '../../components';
import { WHITE, THEME_COLOR } from '../../constants/colors';
import { MergedMapData, Direction } from '../../types/types';
import { GetMap_mapTable_data_coverageData as MapBusiness } from '../../generated/GetMap';
import { useSortableData, useViewport } from '../../helpers';

type Props = {
  data: Array<MergedMapData>;
  hoverFunction: React.Dispatch<React.SetStateAction<MapBusiness | undefined>>;
};

export default function MapTable(props: Props) {
  let { data, hoverFunction } = props;
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
      <DataTable>
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
        <DataTable.Body
          style={{ height: 'fit-content', maxHeight: isDesktop ? 260 : 130 }}
        >
          {sortedData.map((row, index) => (
            <DataTable.Row
              key={'coverage-table-' + row.businessName + index}
              onMouseEnter={() => {
                hoverFunction(row);
              }}
              onMouseLeave={() => {
                hoverFunction(undefined);
              }}
              onPress={() => {
                // for mobile since they cannot hover
                hoverFunction(row);
              }}
              style={{ cursor: 'pointer' }}
            >
              <DataTable.Cell width={200}>{row.businessName}</DataTable.Cell>
              <DataTable.Cell align="right">{row.numLocations}</DataTable.Cell>
            </DataTable.Row>
          ))}
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
