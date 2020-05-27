import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
} from '../../generated/GetPerformanceTable';
import { PerformanceTableType, ReviewTag } from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function PerformanceByCategoryResult(props: Props) {
  let { businessTagId, locationTagId } = props;

  let { data, loading, error } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType: PerformanceTableType.CATEGORY,
      businessTagId,
      locationTagId,
    },
  });
  let noData =
    !data?.performanceTable.data || data.performanceTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="By Category"
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.id || ''}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Category data is not available at this scope. Please widen area of search to see." />
      ) : (
        <PerformanceTable data={data?.performanceTable.data || []} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
