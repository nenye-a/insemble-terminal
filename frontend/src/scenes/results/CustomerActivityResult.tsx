import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetActivity,
  GetActivityVariables,
  GetActivity_activityTable_data as ActivityData,
  GetActivity_activityTable_compareData as ActivityCompareData,
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

export default function CustomerActivityResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetActivity,
    GetActivityVariables
  >(GET_ACTIVITY_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
    },
  });

  let { data: coloredData, comparisonTags } = useColoredData<
    ActivityData,
    ActivityCompareData
  >(
    data?.activityTable.data,
    data?.activityTable.compareData,
    data?.activityTable.comparationTags,
  );
  let noData =
    !data?.activityTable.data || data?.activityTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="Customer Activity"
        noData={noData}
        reviewTag={ReviewTag.ACTIVITY}
        tableId={data?.activityTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
          });
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.ACTIVITY}
        {...(data?.activityTable.businessTag && {
          businessTag: {
            params: data.activityTable.businessTag.params,
            type: data.activityTable.businessTag.type,
          },
        })}
        {...(data?.activityTable.locationTag && {
          locationTag: {
            params: data.activityTable.locationTag.params,
            type: data.activityTable.locationTag.type,
          },
        })}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <ActivityChart
          data={coloredData}
          // compareData={data?.activityTable.compareData}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
