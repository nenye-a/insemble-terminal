import React from 'react';
import styled from 'styled-components';
import { ApolloError } from 'apollo-client';

import { View, LoadingIndicator, Text } from '../../core-ui';
import { DataTable } from '../../components';
import { GetPerformanceTable_performanceTable_data as PerformanceData } from '../../generated/GetPerformanceTable';

import ResultTitle from './ResultTitle';

type Props = {
  data?: Array<PerformanceData>;
  loading: boolean;
  error?: ApolloError;
};

export default function PerformanceByLocationResult(props: Props) {
  let { data, loading, error } = props;
  return (
    <Container>
      <ResultTitle title="By Location" />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <Text>Something went wrong</Text>
      ) : (
        <DataTable>
          <DataTable.HeaderRow>
            <DataTable.HeaderCell width={220}>Company</DataTable.HeaderCell>
            <DataTable.HeaderCell>Sales volume index</DataTable.HeaderCell>
            <DataTable.HeaderCell>Avg rating</DataTable.HeaderCell>
            <DataTable.HeaderCell>Avg # of reviews</DataTable.HeaderCell>
          </DataTable.HeaderRow>
          {data &&
            data?.length > 0 &&
            data.map((row, index) => {
              let {
                name = '',
                avgRating = '',
                numReview = '',
                totalSales = '',
              } = row;
              return (
                <DataTable.Row key={index}>
                  <DataTable.Cell width={220}>{name}</DataTable.Cell>
                  <DataTable.Cell align="right">{totalSales}</DataTable.Cell>
                  <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
                  <DataTable.Cell align="right">{numReview}</DataTable.Cell>
                </DataTable.Row>
              );
            })}
        </DataTable>
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
