import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
  GetPerformanceTable_performanceTable_table_data as PerformanceData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceCompareData,
} from '../../generated/GetPerformanceTable';
import {
  PerformanceTableType,
  ReviewTag,
  TableType,
} from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { formatErrorMessage, useColoredData } from '../../helpers';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';
import PerformanceTablePopover from './PerformanceTablePopover';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  title: string;
  performanceType: PerformanceTableType;
  showNumLocation?: boolean;
  headerTitle?: string;
};

const POLL_INTERVAL = 5000;

export default function PerformanceResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    title,
    performanceType,
    showNumLocation,
    headerTitle,
  } = props;

  let { data, loading, error, refetch, stopPolling, startPolling } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType,
      businessTagId,
      locationTagId,
      tableId,
    },
    pollInterval: POLL_INTERVAL,
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    PerformanceData,
    PerformanceCompareData
  >(
    data?.performanceTable.table?.data,
    data?.performanceTable.table?.compareData,
    data?.performanceTable.table?.comparationTags,
  );
  let noData =
    !data?.performanceTable.table?.data ||
    data.performanceTable.table?.data.length === 0;

  useEffect(() => {
    if (
      (data?.performanceTable.table?.data ||
        data?.performanceTable.error ||
        error) &&
      data?.performanceTable &&
      !data.performanceTable.polling
    ) {
      stopPolling();
    }
  }, [data, error, stopPolling]);

  return (
    <Container>
      <ResultTitle
        title={title}
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.table?.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            performanceType,
            businessTagId,
            locationTagId,
            tableId: newTableId,
          });
          startPolling(POLL_INTERVAL);
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.PERFORMANCE}
        {...(data?.performanceTable.table?.businessTag && {
          businessTag: {
            params: data.performanceTable.table.businessTag.params,
            type: data.performanceTable.table.businessTag.type,
          },
        })}
        {...(data?.performanceTable.table?.locationTag && {
          locationTag: {
            params: data.performanceTable.table.locationTag.params,
            type: data.performanceTable.table.locationTag.type,
          },
        })}
        infoboxContent={PerformanceTablePopover}
      />
      {loading || data?.performanceTable.polling ? (
        <LoadingIndicator />
      ) : error || data?.performanceTable.error ? (
        <ErrorComponent
          text={formatErrorMessage(
            error?.message || data?.performanceTable.error || '',
          )}
        />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <PerformanceTable
          data={coloredData}
          showNumLocation={showNumLocation}
          headerTitle={headerTitle}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
