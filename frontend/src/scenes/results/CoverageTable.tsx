import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { DataTable } from '../../components';
import { WHITE, THEME_COLOR } from '../../constants/colors';
import { MergedCoverageData } from '../../types/types';

type Props = {
  data: Array<MergedCoverageData>;
};

export default function CoverageTable(props: Props) {
  let { data } = props;
  return (
    <Container>
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
          <DataTable.HeaderCell align="right">
            Number Locations
          </DataTable.HeaderCell>
        </DataTable.HeaderRow>
        <DataTable.Body style={{ height: 'fit-content', maxHeight: 260 }}>
          {data.map((item, index) => {
            let { coverageData } = item;
            return coverageData.map((row) => (
              <DataTable.Row key={'coverage-table-' + row.businessName + index}>
                <DataTable.Cell width={200}>{row.businessName}</DataTable.Cell>
                <DataTable.Cell align="right">
                  {row.numLocations}
                </DataTable.Cell>
              </DataTable.Row>
            ));
          })}
        </DataTable.Body>
      </DataTable>
    </Container>
  );
}

const Container = styled(View)`
  width: 410px;
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
