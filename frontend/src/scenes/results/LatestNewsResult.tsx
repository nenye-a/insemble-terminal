import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';
import NewsTable from './NewsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function LatestNewsResult(props: Props) {
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
        title="Latest News"
        noData={noData}
        reviewTag={ReviewTag.NEWS}
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
        <EmptyDataComponent text="News not available at this scope. Widen scope of search to see latest news." />
      ) : (
        <NewsTable
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
