import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType, DemoType } from '../../generated/globalTypes';
import {
  GetNewsTable,
  GetNewsTableVariables,
  GetNewsTable_newsTable_table_data as NewsData,
  GetNewsTable_newsTable_table_compareData as NewsCompareData,
  GetNewsTable_newsTable_table_comparationTags as ComparationTags,
} from '../../generated/GetNewsTable';
import { GET_NEWS_TABLE_DATA } from '../../graphql/queries/server/results';
import { formatErrorMessage, useColoredData, useViewport } from '../../helpers';

import ResultTitle from './ResultTitle';
import NewsTable from './NewsTable';
import FeedbackButton from './FeedbackButton';
import NewsTableMobile from './NewsTableMobile';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  readOnly?: boolean;
  demoType?: DemoType;
};

type ColoredData = (NewsData | NewsCompareData) & {
  isComparison: boolean;
};

const POLL_INTERVAL = 5000;

export default function LatestNewsResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    pinTableId,
    readOnly,
    demoType,
  } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let alert = useAlert();
  let { isDesktop } = useViewport();

  let {
    data,
    loading: newsLoading,
    error,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<GetNewsTable, GetNewsTableVariables>(GET_NEWS_TABLE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
      demo: demoType,
    },
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    NewsData,
    NewsCompareData
  >(
    data?.newsTable.table?.data,
    data?.newsTable.table?.compareData,
    data?.newsTable.table?.comparationTags,
    sortOrder,
  );
  let csvData = useMemo(
    () =>
      // destructure the exported columns
      coloredData.map(({ title, link, source, published }) => ({
        title,
        link,
        source,
        published,
      })),
    [coloredData],
  );
  let csvHeader = [
    { label: 'Title', key: 'title' },
    { label: 'Link', key: 'link' },
    { label: 'Source', key: 'source' },
    { label: 'Post Date', key: 'published' },
  ];
  let noData =
    !data?.newsTable.table?.data || data.newsTable.table?.data.length === 0;
  let loading = newsLoading || data?.newsTable.polling;

  useEffect(() => {
    if (
      (data?.newsTable.table?.data || data?.newsTable.error || error) &&
      data?.newsTable &&
      !data.newsTable.polling
    ) {
      stopPolling();
      if (data.newsTable.table) {
        let { compareData, comparationTags, id } = data.newsTable.table;
        /**
         * If compareData and compareTag sizes are not the same,
         * it is possible that one of the compare data failed to fetch
         */
        if (compareData.length !== comparationTags.length) {
          // Filter function to find which compare data is missing
          let notIncludedFilterFn = (tag: ComparationTags) =>
            !compareData.map((item) => item.compareId).includes(tag.id);
          // List of business/location which doesn't have compare data
          let notIncluded = comparationTags
            .filter(notIncludedFilterFn)
            .map(
              (item) => item.businessTag?.params || item.locationTag?.params,
            );
          // List of compareId which doesn't have data
          let notIncludedTagId = comparationTags
            .filter(notIncludedFilterFn)
            .map((item) => item.id);
          if (notIncluded.length > 0) {
            // Remove compareIds which doesn't have data from sortOrder list
            let newSortOrder = sortOrder.filter((item) => {
              return !notIncludedTagId.includes(item);
            });
            setSortOrder(newSortOrder);
            alert.show(
              `No data available for ${notIncluded.join(
                ', ',
              )}. Please check your search and try again`,
            );
            // Fetch previous table if error
            if (prevTableId) {
              refetch({
                tableId: prevTableId,
              });
            }
          }
        } else {
          setPrevData(coloredData);
          setPrevTableId(id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    startPolling(POLL_INTERVAL);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <ResultTitle
        title="Latest News"
        noData={noData}
        demo={!!demoType}
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
        pinTableId={pinTableId}
        sortOrder={sortOrder}
        onSortOrderChange={(newSortOrder: Array<string>) =>
          setSortOrder(newSortOrder)
        }
        readOnly={readOnly}
        csvData={csvData}
        csvHeader={csvHeader}
      />
      <View>
        {loading && <LoadingIndicator mode="overlap" />}
        {loading && prevData.length === 0 ? (
          <View style={{ height: 90 }} />
        ) : error || data?.newsTable.error ? (
          <ErrorComponent
            text={formatErrorMessage(
              error?.message || data?.newsTable.error || '',
            )}
            onRetry={refetch}
          />
        ) : (!loading &&
            data?.newsTable.table &&
            data.newsTable.table.data.length > 0) ||
          prevData.length > 0 ? (
          isDesktop ? (
            <NewsTable
              data={loading ? prevData : coloredData}
              demo={!!demoType}
            />
          ) : (
            <NewsTableMobile
              data={loading ? prevData : coloredData}
              demo={!!demoType}
            />
          )
        ) : noData && !loading ? (
          <EmptyDataComponent />
        ) : null}
      </View>
      {!readOnly && !demoType && (
        <FeedbackButton
          tableId={data?.newsTable.table?.id}
          tableType={TableType.NEWS}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
