import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
  GetPerformanceTable_performanceTable_data as PerformanceData,
  GetPerformanceTable_performanceTable_compareData as PerformanceCompareData,
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
};

export default function PerformanceByLocationResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;

  let { data, loading, error, refetch } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType: PerformanceTableType.ADDRESS,
      businessTagId,
      locationTagId,
      tableId,
    },
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    PerformanceData,
    PerformanceCompareData
  >(
    data?.performanceTable.data,
    data?.performanceTable.compareData,
    data?.performanceTable.comparationTags,
  );
  let noData =
    !data?.performanceTable.data || data.performanceTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="By Location"
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            performanceType: PerformanceTableType.ADDRESS,
            businessTagId,
            locationTagId,
            tableId: newTableId,
          });
        }}
        comparisonTags={comparisonTags}
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
          data={coloredData}
          showNumLocation={false}
          headerTitle="Address"
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
