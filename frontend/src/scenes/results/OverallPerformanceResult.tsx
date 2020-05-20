import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';
import { DataTable } from '../../components';

import ResultTitle from './ResultTitle';

export default function OverallPerformanceResult() {
  return (
    <Container>
      <ResultTitle title="Overall Performance" />
      <DataTable>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell width={220}>Company</DataTable.HeaderCell>
          <DataTable.HeaderCell>Sales volume index</DataTable.HeaderCell>
          <DataTable.HeaderCell>Avg rating</DataTable.HeaderCell>
          <DataTable.HeaderCell>Avg # of reviews</DataTable.HeaderCell>
          <DataTable.HeaderCell># Locations</DataTable.HeaderCell>
        </DataTable.HeaderRow>
      </DataTable>
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
