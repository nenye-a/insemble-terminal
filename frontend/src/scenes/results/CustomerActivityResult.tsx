import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetActivity,
  GetActivityVariables,
  GetActivity_activityTable_table_data as ActivityData,
  GetActivity_activityTable_table_compareData as ActivityCompareData,
} from '../../generated/GetActivity';
import { GET_ACTIVITY_DATA } from '../../graphql/queries/server/results';
import { formatErrorMessage, useColoredData } from '../../helpers';

import ResultTitle from './ResultTitle';
import ActivityChart from './ActivityChart';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
};

const POLL_INTERVAL = 5000;

export default function CustomerActivityResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { data, loading, error, refetch, stopPolling, startPolling } = useQuery<
    GetActivity,
    GetActivityVariables
  >(GET_ACTIVITY_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
    },
    pollInterval: POLL_INTERVAL,
  });

  let { data: coloredData, comparisonTags } = useColoredData<
    ActivityData,
    ActivityCompareData
  >(
    data?.activityTable.table?.data,
    data?.activityTable.table?.compareData,
    data?.activityTable.table?.comparationTags,
  );
  let noData =
    !data?.activityTable.table?.data ||
    data?.activityTable.table.data.length === 0;

  useEffect(() => {
    if (
      (data?.activityTable.table?.data || data?.activityTable.error || error) &&
      data?.activityTable &&
      !data.activityTable.polling
    ) {
      stopPolling();
    }
  }, [data, error, stopPolling]);

  return (
    <Container>
      <ResultTitle
        title="Customer Activity"
        noData={noData}
        reviewTag={ReviewTag.ACTIVITY}
        tableId={data?.activityTable.table?.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
          });
          startPolling(POLL_INTERVAL);
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.ACTIVITY}
        {...(data?.activityTable.table?.businessTag && {
          businessTag: {
            params: data.activityTable.table.businessTag.params,
            type: data.activityTable.table.businessTag.type,
          },
        })}
        {...(data?.activityTable.table?.locationTag && {
          locationTag: {
            params: data.activityTable.table.locationTag.params,
            type: data.activityTable.table.locationTag.type,
          },
        })}
      />
      {loading || data?.activityTable.polling ? (
        <LoadingIndicator />
      ) : error || data?.activityTable.error ? (
        <ErrorComponent
          text={formatErrorMessage(
            error?.message || data?.activityTable.error || '',
          )}
        />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <ActivityChart data={coloredData} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
