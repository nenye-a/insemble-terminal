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
import {
  PerformanceTableType,
  ReviewTag,
  TableType,
} from '../../generated/globalTypes';
import { formatErrorMessage } from '../../helpers';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';
import PerformanceTablePopover from './PerformanceTablePopover';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
};

export default function OverallPerformanceResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType: PerformanceTableType.OVERALL,
      businessTagId,
      locationTagId,
      tableId,
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
        tableType={TableType.PERFORMANCE}
        {...(data?.performanceTable.businessTag && {
          businessTag: {
            params: data.performanceTable.businessTag.params,
            type: data.performanceTable.businessTag.type,
          },
        })}
        {...(data?.performanceTable.locationTag && {
          locationTag: {
            params: data.performanceTable.locationTag.params,
            type: data.performanceTable.locationTag.type,
          },
        })}
        infoboxContent={PerformanceTablePopover}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : noData ? (
        <EmptyDataComponent />
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
