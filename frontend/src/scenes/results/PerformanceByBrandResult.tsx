import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
} from '../../generated/GetPerformanceTable';
import {
  PerformanceTableType,
  ReviewTag,
  TableType,
} from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function PerformanceByBrand(props: Props) {
  let { businessTagId, locationTagId } = props;

  let { data, loading, error, refetch } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType: PerformanceTableType.BRAND,
      businessTagId,
      locationTagId,
    },
  });
  let noData =
    !data?.performanceTable.data || data.performanceTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="By Brand"
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            performanceType: PerformanceTableType.BRAND,
            businessTagId,
            locationTagId,
            tableId: newTableId,
          });
        }}
        comparisonTags={data?.performanceTable.comparationTags}
        tableType={TableType.PERFORMANCE}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Brand data is not available at this scope. Please widen area of search to see." />
      ) : (
        <PerformanceTable data={data?.performanceTable.data || []} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
