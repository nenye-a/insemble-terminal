import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetNewsTable,
  GetNewsTableVariables,
  GetNewsTable_newsTable_data as NewsData,
  GetNewsTable_newsTable_compareData as NewsCompareData,
} from '../../generated/GetNewsTable';
import { GET_NEWS_TABLE_DATA } from '../../graphql/queries/server/results';
import { formatErrorMessage, useColoredData } from '../../helpers';

import ResultTitle from './ResultTitle';
import NewsTable from './NewsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
};

export default function LatestNewsResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetNewsTable,
    GetNewsTableVariables
  >(GET_NEWS_TABLE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
    },
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    NewsData,
    NewsCompareData
  >(
    data?.newsTable.data,
    data?.newsTable.compareData,
    data?.newsTable.comparationTags,
  );
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
        comparisonTags={comparisonTags}
        tableType={TableType.NEWS}
        {...(data?.newsTable.businessTag && {
          businessTag: {
            params: data.newsTable.businessTag.params,
            type: data.newsTable.businessTag.type,
          },
        })}
        {...(data?.newsTable.locationTag && {
          locationTag: {
            params: data.newsTable.locationTag.params,
            type: data.newsTable.locationTag.type,
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
        <NewsTable data={coloredData} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
