import React from 'react';
import styled from 'styled-components';
import { ApolloError } from 'apollo-client';

import { View, LoadingIndicator } from '../../core-ui';
import {
  DataTable,
  EmptyDataComponent,
  ErrorComponent,
} from '../../components';
import { GetPerformanceTable_performanceTable_data as PerformanceData } from '../../generated/GetPerformanceTable';

import ResultTitle from './ResultTitle';

type Props = {
  data?: Array<PerformanceData>;
  loading: boolean;
  error?: ApolloError;
};

export default function OverallPerformanceResult(props: Props) {
  let { data, loading, error } = props;
  let noData = !data || data?.length === 0;
  return (
    <Container>
      <ResultTitle title="Overall Performance" noData={noData} />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Overall data is not available at this scope. Please widen area of search to see." />
      ) : (
        <DataTable>
          <DataTable.HeaderRow>
            <DataTable.HeaderCell width={220}>Company</DataTable.HeaderCell>
            <DataTable.HeaderCell>Sales volume index</DataTable.HeaderCell>
            <DataTable.HeaderCell>Avg rating</DataTable.HeaderCell>
            <DataTable.HeaderCell>Avg # of reviews</DataTable.HeaderCell>
            <DataTable.HeaderCell># Locations</DataTable.HeaderCell>
          </DataTable.HeaderRow>
          {data &&
            data?.length > 0 &&
            data.map((row, index) => {
              let {
                name = '',
                avgRating = '',
                numLocation = '',
                numReview = '',
                totalSales = '',
              } = row;
              return (
                <DataTable.Row key={index}>
                  <DataTable.Cell width={220}>{name}</DataTable.Cell>
                  <DataTable.Cell align="right">{totalSales}</DataTable.Cell>
                  <DataTable.Cell align="right">{avgRating}</DataTable.Cell>
                  <DataTable.Cell align="right">{numReview}</DataTable.Cell>
                  <DataTable.Cell align="right">
                    {numLocation || 'N/A'}
                  </DataTable.Cell>
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
