import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';
import {
  GetNewsTable,
  GetNewsTableVariables,
} from '../../generated/GetNewsTable';
import { GET_NEWS_TABLE_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import NewsTable from './NewsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function LatestNewsResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetNewsTable,
    GetNewsTableVariables
  >(GET_NEWS_TABLE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
    },
  });

  let noData = !data?.newsTable.data || data.newsTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="Latest News"
        noData={noData}
        reviewTag={ReviewTag.NEWS}
        tableId={data?.newsTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
          });
        }}
        comparisonTags={data?.newsTable.comparationTags}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="News not available at this scope. Widen scope of search to see latest news." />
      ) : (
        <NewsTable
          data={data?.newsTable.data || []}
          compareData={data?.newsTable.compareData || []}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
