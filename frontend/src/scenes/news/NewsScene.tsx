import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { View, LoadingIndicator } from '../../core-ui';
import { formatErrorMessage, useColoredData } from '../../helpers';
import {
  EmptyDataComponent,
  ErrorComponent,
  PageTitle,
} from '../../components';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetNewsTable,
  GetNewsTableVariables,
  GetNewsTable_newsTable_table_data as NewsData,
  GetNewsTable_newsTable_table_compareData as NewsCompareData,
} from '../../generated/GetNewsTable';
import { GET_NEWS_TABLE_DATA } from '../../graphql/queries/server/results';
import { BACKGROUND_COLOR } from '../../constants/colors';
import ResultTitle from '../results/ResultTitle';
import NewsTable from '../results/NewsTable';
import FeedbackButton from '../results/FeedbackButton';
import LatestNewsResult from '../results/LatestNewsResult';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  readOnly?: boolean;
};

type ColoredData = (NewsData | NewsCompareData) & {
  isComparison: boolean;
};

const POLL_INTERVAL = 5000;

export default function NewsScene(props: Props) {
  let { businessTagId, locationTagId, tableId, pinTableId, readOnly } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let alert = useAlert();

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
    <>
      <PageTitle text="News" rightText="5/1" />
      <Container>
        <LatestNewsResult />
      </Container>
    </>
  );
}

const Container = styled(View)`
  padding: 20px 15%;
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;

const TitleContainer = styled(View)`
  padding: 20px 15%;
`;
