import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { Modal, Text, View, Divider } from '../../core-ui';
import { getPublishedDate } from '../../helpers';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { GRAY_TEXT, THEME_COLOR } from '../../constants/colors';

type State = {
  title: string;
  source: string;
  published: string;
  link: string;
};

type Params = {
  newsId: string;
};

export default function NewsPreview() {
  let history = useHistory<State>();
  let {
    title = '-',
    source = '-',
    published = '-',
    link = '-',
  } = history.location.state;

  // TODO: get news detail by id.
  return (
    <>
      <Container
        visible={true}
        hideCloseButton={true}
        onClose={() => {
          // TODO: check length. if it's the first state then push other scene
          history.goBack();
        }}
      >
        <TitleContainer>
          <Text color={THEME_COLOR}>Article</Text>
          <Title>{title}</Title>
          <Row>
            <Text color={GRAY_TEXT} fontWeight={FONT_WEIGHT_MEDIUM}>
              {source}
            </Text>
            <PublishedDate>{getPublishedDate(published)}</PublishedDate>
          </Row>
        </TitleContainer>
        <Divider width={12} />
        <Iframe src={link} />
      </Container>
    </>
  );
}

const Container = styled(Modal)`
  width: 750px;
  height: 80vh;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const TitleContainer = styled(View)`
  padding: 9px 18px;
`;

const Title = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding: 4px 0;
`;

const Row = styled(View)`
  flex-direction: row;
`;

const Iframe = styled.iframe`
  height: 60vh;
`;

const PublishedDate = styled(Text)`
  margin-left: 45px;
  color: ${GRAY_TEXT};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
