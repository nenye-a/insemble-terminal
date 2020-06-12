import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetNewsTable,
  GetNewsTableVariables,
  GetNewsTable_newsTable_table_data as NewsData,
  GetNewsTable_newsTable_table_compareData as NewsCompareData,
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

const POLL_INTERVAL = 5000;

export default function LatestNewsResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let alert = useAlert();

  let { data, loading, error, refetch, startPolling, stopPolling } = useQuery<
    GetNewsTable,
    GetNewsTableVariables
  >(GET_NEWS_TABLE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
    },
    pollInterval: POLL_INTERVAL,
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    NewsData,
    NewsCompareData
  >(
    data?.newsTable.table?.data,
    data?.newsTable.table?.compareData,
    data?.newsTable.table?.comparationTags,
  );
  let noData =
    !data?.newsTable.table?.data || data.newsTable.table?.data.length === 0;

  useEffect(() => {
    if (
      (data?.newsTable.table?.data || data?.newsTable.error || error) &&
      data?.newsTable &&
      !data.newsTable.polling
    ) {
      stopPolling();
      if (data.newsTable.table) {
        let { compareData, comparationTags } = data.newsTable.table;
        if (compareData.length !== comparationTags.length) {
          let notIncluded = comparationTags
            .filter(
              (tag) =>
                !compareData.map((item) => item.compareId).includes(tag.id),
            )
            .map((item) => item.businessTag?.params);
          if (notIncluded.length > 0) {
            alert.show(
              `No data available for ${notIncluded.join(
                ', ',
              )}. Please check your search and try again`,
            );
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Container>
      <ResultTitle
        title="Latest News"
        noData={noData}
        reviewTag={ReviewTag.NEWS}
        tableId={data?.newsTable.table?.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
          });
          startPolling(POLL_INTERVAL);
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.NEWS}
        {...(data?.newsTable.table?.businessTag && {
          businessTag: {
            params: data.newsTable.table.businessTag.params,
            type: data.newsTable.table.businessTag.type,
          },
        })}
        {...(data?.newsTable.table?.locationTag && {
          locationTag: {
            params: data.newsTable.table.locationTag.params,
            type: data.newsTable.table.locationTag.type,
          },
        })}
      />
      {loading || data?.newsTable.polling ? (
        <LoadingIndicator />
      ) : error || data?.newsTable.error ? (
        <ErrorComponent
          text={formatErrorMessage(
            error?.message || data?.newsTable.error || '',
          )}
        />
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
