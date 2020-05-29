import React from 'react';
import styled from 'styled-components';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';
import {
  DUMMY_ACTIVITY_DATA,
  DUMMY_ACTIVITY_COMPARE_DATA,
} from '../../fixtures/dummyData';

import ResultTitle from './ResultTitle';
import ActivityChart from './ActivityChart';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function CustomerActivityResult(_props: Props) {
  // TODO: change to useQuery
  let { data, loading, error } = {
    loading: false,
    data: {
      data: DUMMY_ACTIVITY_DATA,
      compareData: DUMMY_ACTIVITY_COMPARE_DATA,
    },
    error: null,
  };
  let noData = data.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="Customer Activity"
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE} // change enum
        tableId=""
        onTableIdChange={(_newTableId: string) => {
          // TODO: refetch
        }}
        comparisonTags={[]}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Consumer activity details are not available at this scope. Please include a brand." />
      ) : (
        <ActivityChart data={data.data} compareData={data.compareData} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
