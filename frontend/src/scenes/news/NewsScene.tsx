import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router-dom';

import { View, LoadingIndicator } from '../../core-ui';
import { formatErrorMessage, useViewport, capitalize } from '../../helpers';
import {
  EmptyDataComponent,
  ErrorComponent,
  PageTitle,
  HeaderNavigationBar,
} from '../../components';
import { GET_OPEN_NEWS_DATA } from '../../graphql/queries/server/results';
import { BACKGROUND_COLOR } from '../../constants/colors';
import ResultTitle from '../results/ResultTitle';
import NewsTable from '../results/NewsTable';
import NewsTableMobile from '../results/NewsTableMobile';
import FeedbackButton from '../results/FeedbackButton';
import {
  GetOpenNewsData,
  GetOpenNewsDataVariables,
} from '../../generated/GetOpenNewsData';
import { MergedNewsData, SearchTag } from '../../types/types';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import { useAuth } from '../../context';

type Props = {
  readOnly?: boolean;
};

type State = {
  // state that should be passed when navigating to results scene
  search?: SearchTag;

  // state that should be passed when opening the news modal
  title?: string;
  source?: string;
  published?: string;
  link?: string;
  background?: {
    state?: State;
  };
};

type Params = {
  openNewsId: string;
};

const POLL_INTERVAL = 5000;

export default function NewsScene(props: Props) {
  let { readOnly } = props;
  let { isAuthenticated } = useAuth();
  let { isDesktop } = useViewport();
  let history = useHistory<State>();
  let { openNewsId } = useParams<Params>();
  let {
    data,
    loading: newsLoading,
    error,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<GetOpenNewsData, GetOpenNewsDataVariables>(GET_OPEN_NEWS_DATA, {
    variables: {
      openNewsId: openNewsId || '',
    },
    skip: !openNewsId,
    onCompleted: (data) => {
      if (data?.openNews.firstArticle) {
        let { title, source, published, link } = data.openNews.firstArticle;
        history.push(`/news/${openNewsId}/main`, {
          title,
          source,
          published,
          link,
          background: history.location,
        });
      }
    },
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
      <Container isDesktop={isDesktop}>
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
              onRetry={refetch}
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
        {isAuthenticated && (
          <FeedbackButton
            tableId={data?.openNews.id || ''}
            tableType={TableType.NEWS}
          />
        )}
      </Container>
    </>
  );
}

const Container = styled(View)<ViewProps & WithViewport>`
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 0`)};
  background-color: ${BACKGROUND_COLOR};
`;
