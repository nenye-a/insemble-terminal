import React, { ComponentProps, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import {
  Modal,
  Text,
  View,
  Divider,
  TouchableOpacity,
  LoadingIndicator,
} from '../../core-ui';
import { ErrorComponent } from '../../components';
import { getPublishedDate, useViewport } from '../../helpers';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { GRAY_TEXT, THEME_COLOR } from '../../constants/colors';
import { GET_OPEN_NEWS_DATA } from '../../graphql/queries/server/results';
import SvgArrowLeft from '../../components/icons/arrow-left';
import {
  GetOpenNewsData,
  GetOpenNewsDataVariables,
} from '../../generated/GetOpenNewsData';
import NewsScene from '../news/NewsScene';

type State = {
  title?: string;
  source?: string;
  published?: string;
  link?: string;
  openNewsId?: string;
  background?: any;
};

type Params = {
  newsId: string;
};

export default function NewsPreview() {
  let { isDesktop } = useViewport();
  let history = useHistory<State>();
  let { newsId } = useParams<Params>();
  let { data, loading: newsLoading, error, stopPolling } = useQuery<
    GetOpenNewsData,
    GetOpenNewsDataVariables
  >(GET_OPEN_NEWS_DATA, {
    variables: {
      openNewsId: newsId,
    },
    skip: !!history.location.state,
    pollInterval: 5000,
  });
  let goBack = () => {
    if (data) {
      history.push('/news', {
        openNewsId: newsId,
      });
    } else {
      history.goBack();
    }
  };

  let renderNewsModal = (
    title: string,
    source: string,
    published: string,
    link: string,
  ) => {
    return (
      <>
        <TitleContainer isDesktop={isDesktop}>
          {!isDesktop && (
            <TouchableOpacity onPress={goBack}>
              <SvgArrowLeft style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
          <View flex>
            <Text color={THEME_COLOR}>Article</Text>
            <Title>{title}</Title>
            <Row>
              <Text color={GRAY_TEXT} fontWeight={FONT_WEIGHT_MEDIUM}>
                {source}
              </Text>
              <PublishedDate>{getPublishedDate(published)}</PublishedDate>
            </Row>
          </View>
        </TitleContainer>
        <Divider width={12} />
        <Iframe src={link} />
      </>
    );
  };

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

  if (history.location.state?.background) {
    let {
      title = '',
      source = '',
      published = '',
      link = '',
    } = history.location.state;
    return (
      <Container
        visible={true}
        hideCloseButton={true}
        onClose={goBack}
        isDesktop={isDesktop}
      >
        {renderNewsModal(title, source, published, link)}
      </Container>
    );
  }

  return (
    <>
      <NewsScene readOnly={true} {...(data && { openNewsId: newsId })} />
      <Container
        visible={true}
        hideCloseButton={true}
        onClose={goBack}
        isDesktop={isDesktop}
      >
        {newsLoading || data?.openNews.polling ? (
          <LoadingIndicator />
        ) : data?.openNews.firstArticle ? (
          renderNewsModal(
            data.openNews.firstArticle.title,
            data.openNews.firstArticle.source,
            data.openNews.firstArticle.published,
            data.openNews.firstArticle.link,
          )
        ) : error || data?.openNews.error ? (
          <ErrorComponent text={error?.message || data?.openNews.error || ''} />
        ) : null}
      </Container>
    </>
  );
}

type ContainerProps = ComponentProps<typeof Modal> & {
  isDesktop: boolean;
};

type TitleContainerProps = ViewProps & { isDesktop: boolean };

const Container = styled(Modal)<ContainerProps>`
  width: ${({ isDesktop }) => (isDesktop ? '750px' : '100%')};
  height: 80vh;
  border-radius: ${({ isDesktop }) =>
    isDesktop ? DEFAULT_BORDER_RADIUS : '2px'};
`;

const TitleContainer = styled(View)<TitleContainerProps>`
  padding: ${({ isDesktop }) => (isDesktop ? `9px 18px` : `14px 12px`)};
  flex-direction: row;
  align-items: center;
`;

const Title = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding: 4px 0;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Iframe = styled.iframe`
  height: 60vh;
`;

const PublishedDate = styled(Text)`
  margin-left: 45px;
  color: ${GRAY_TEXT};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
