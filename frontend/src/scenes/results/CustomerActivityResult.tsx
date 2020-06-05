import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import { GetActivity, GetActivityVariables } from '../../generated/GetActivity';
import { GET_ACTIVITY_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import ActivityChart from './ActivityChart';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function CustomerActivityResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetActivity,
    GetActivityVariables
  >(GET_ACTIVITY_DATA, {
    variables: {
      businessTagId,
      locationTagId,
    },
  });
  let noData = data?.activityTable.data.length === 0;

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
        comparisonTags={data?.activityTable.comparationTags}
        tableType={TableType.ACTIVITY}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Consumer activity details are not available at this scope. Please include a brand." />
      ) : (
        <ActivityChart
          data={data?.activityTable.data}
          compareData={data?.activityTable.compareData}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
