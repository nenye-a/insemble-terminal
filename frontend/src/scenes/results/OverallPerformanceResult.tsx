import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import {
  DataTable,
  EmptyDataComponent,
  ErrorComponent,
} from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
} from '../../generated/GetPerformanceTable';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { PerformanceTableType } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function OverallPerformanceResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType: PerformanceTableType.OVERALL,
      businessTagId,
      locationTagId,
    },
  });
  let noData =
    !data?.performanceTable.data || data.performanceTable.data.length === 0;
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
          {data?.performanceTable.data &&
            data?.performanceTable.data.length > 0 &&
            data.performanceTable.data.map((row, index) => {
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
