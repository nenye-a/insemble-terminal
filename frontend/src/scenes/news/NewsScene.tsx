import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';
import { useHistory } from 'react-router-dom';

import { View, LoadingIndicator } from '../../core-ui';
import { formatErrorMessage, useViewport, capitalize } from '../../helpers';
import {
  EmptyDataComponent,
  ErrorComponent,
  PageTitle,
  HeaderNavigationBar,
} from '../../components';
import {
  GetNewsTable_newsTable_table_data as NewsData,
  GetNewsTable_newsTable_table_compareData as NewsCompareData,
} from '../../generated/GetNewsTable';
import { GET_OPEN_NEWS_DATA } from '../../graphql/queries/server/results';
import { BACKGROUND_COLOR } from '../../constants/colors';
import ResultTitle from '../results/ResultTitle';
import NewsTable from '../results/NewsTable';
import FeedbackButton from '../results/FeedbackButton';
import {
  GetOpenNewsData,
  GetOpenNewsDataVariables,
} from '../../generated/GetOpenNewsData';
import NewsTableMobile from '../results/NewsTableMobile';
import { MergedNewsData, SearchTag } from '../../types/types';
import { ReviewTag, TableType } from '../../generated/globalTypes';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  readOnly?: boolean;
  openNewsId?: string;
};

type ColoredData = (NewsData | NewsCompareData) & {
  isComparison: boolean;
};

const POLL_INTERVAL = 5000;

type State = {
  openNewsId?: string;
  background?: {
    state?: {
      openNewsId?: string;
    };
  };
  search?: SearchTag;
};
export default function NewsScene(props: Props) {
  let {
    // businessTagId,
    // locationTagId,
    // tableId,
    // pinTableId,
    readOnly,
    openNewsId: openNewsIdProp,
  } = props;
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let alert = useAlert();
  let { isDesktop } = useViewport();
  let history = useHistory<State>();
  let openNewsId =
    openNewsIdProp ||
    history.location.state?.openNewsId ||
    history.location.state?.background?.state?.openNewsId ||
    '';
  console.log(openNewsIdProp, history.location.state, 'OPEN NEWS ID');
  let {
    data,
    loading: newsLoading,
    error,
    startPolling,
    stopPolling,
  } = useQuery<GetOpenNewsData, GetOpenNewsDataVariables>(GET_OPEN_NEWS_DATA, {
    variables: {
      openNewsId: openNewsId || '',
    },
    skip: !openNewsId,
  });

  let noData = !data?.openNews.data || data.openNews.data.length === 0;
  let loading = newsLoading || data?.openNews.polling;
  let now = Date.now();
  let today =
    (new Date(now).getMonth() + 1).toString() +
    '/' +
    new Date(now).getDate().toString();

  useEffect(() => {
    if (
      (data?.openNews?.data || data?.openNews.error || error) &&
      data?.openNews &&
      !data.openNews.polling
    ) {
      stopPolling();
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
      <HeaderNavigationBar
        readOnly={readOnly}
        showSearchBar={true}
        onSearchPress={(search) => {
          history.push('/results', { search });
        }}
        defaultReviewTag={capitalize(ReviewTag.NEWS)}
        defaultBusinessTag={data?.openNews.businessTag}
        defaultLocationTag={
          data?.openNews.locationTag?.params
            ? {
                params: data?.openNews.locationTag?.params,
                type: data?.openNews.locationTag.type,
              }
            : undefined
        }
      />
      <PageTitle text="News" rightText={today} />
      <Container>
        <ResultTitle
          title="Latest News"
          noData={noData}
          reviewTag={ReviewTag.NEWS}
          tableId=""
          tableType={TableType.NEWS}
          readOnly={readOnly}
        />
        <View>
          {loading && <LoadingIndicator mode="overlap" />}
          {loading ? (
            <View style={{ height: 90 }} />
          ) : error || data?.openNews.error ? (
            <ErrorComponent
              text={formatErrorMessage(
                error?.message || data?.openNews.error || '',
              )}
            />
          ) : !loading &&
            data?.openNews.data &&
            data.openNews.data.length > 0 ? (
            isDesktop ? (
              <NewsTable
                data={
                  ((data?.openNews.data || []) as unknown) as Array<
                    MergedNewsData
                  >
                }
              />
            ) : (
              <NewsTableMobile
                data={
                  ((data?.openNews.data || []) as unknown) as Array<
                    MergedNewsData
                  >
                }
              />
            )
          ) : noData && !loading ? (
            <EmptyDataComponent />
          ) : null}
        </View>
        {/* {!readOnly && (
          <FeedbackButton
            tableId={data?.openNews.data?.id}
            tableType={TableType.NEWS}
          />
        )} */}
      </Container>
    </>
  );
}

const Container = styled(View)`
  padding: 20px 15%;
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;
