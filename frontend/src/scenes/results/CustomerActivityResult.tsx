import React from 'react';
import styled from 'styled-components';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';
import ActivityChart from './ActivityChart';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function CustomerActivityResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = {
    loading: false,
    data: [
      {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
      },
      {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
      },
      {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
      },
      {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
      },
      {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
      },
      {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
      },
      {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
      },
    ],
    error: null,
    refetch: () => {},
  };
  let noData = data.length === 0;

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
        <EmptyDataComponent text="Overall data is not available at this scope. Please widen area of search to see." />
      ) : (
        <ActivityChart data={data} compareData={[]} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
