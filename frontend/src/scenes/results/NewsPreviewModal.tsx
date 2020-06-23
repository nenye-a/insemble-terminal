import React, { ComponentProps } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { Modal, Text, View, Divider, TouchableOpacity } from '../../core-ui';
import { getPublishedDate, useViewport } from '../../helpers';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { GRAY_TEXT, THEME_COLOR } from '../../constants/colors';
import SvgArrowLeft from '../../components/icons/arrow-left';

type State = {
  title?: string;
  source?: string;
  published?: string;
  link?: string;
  background?: ObjectKey;
};

export default function NewsPreview() {
  let { isDesktop } = useViewport();
  let history = useHistory<State>();

  let goBack = () => {
    history.goBack();
  };

  // if (true) {
  let {
    title = '',
    source = '',
    published = '',
    link = '',
  } = history.location.state;
  console.log('masuk modal');
  return (
    <Container
      visible={true}
      hideCloseButton={true}
      onClose={goBack}
      isDesktop={isDesktop}
    >
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
    </Container>
  );
  // }

  // return null;
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
  justify-content: center;
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
  height: 100%;
`;

const PublishedDate = styled(Text)`
  margin-left: 45px;
  color: ${GRAY_TEXT};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
