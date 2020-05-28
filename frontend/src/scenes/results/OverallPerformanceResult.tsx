import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
} from '../../generated/GetPerformanceTable';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { PerformanceTableType, ReviewTag } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function OverallPerformanceResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
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
      <ResultTitle
        title="Overall Performance"
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            performanceType: PerformanceTableType.OVERALL,
            businessTagId,
            locationTagId,
            tableId: newTableId,
          });
        }}
        comparisonTags={data?.performanceTable.comparationTags}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Overall data is not available at this scope. Please widen area of search to see." />
      ) : (
        <PerformanceTable
          data={data?.performanceTable.data || []}
          compareData={data?.performanceTable.compareData}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
