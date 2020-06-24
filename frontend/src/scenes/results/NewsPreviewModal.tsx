import React, { ComponentProps } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import {
  Modal,
  Text,
  View,
  Divider,
  TouchableOpacity,
  Button,
} from '../../core-ui';
import { getPublishedDate, useViewport } from '../../helpers';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { GRAY_TEXT, THEME_COLOR, WHITE } from '../../constants/colors';

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
  let {
    title = '',
    source = '',
    published = '',
    link = '',
  } = history.location.state;
  let goBack = () => {
    history.goBack();
  };

  let websiteButton = (
    <Button
      mode="withShadow"
      shape="round"
      text="See on Website"
      onPress={() => {
        window.open(link);
      }}
      href={link}
    />
  );
  return (
    <Container
      visible={true}
      hideCloseButton={true}
      onClose={goBack}
      isDesktop={isDesktop}
      {...(isDesktop && {
        overlayStyle: {
          alignItems: 'flex-end',
        },
      })}
    >
      <BackButtonContainer onPress={goBack}>
        <Text color={WHITE}>Return to News</Text>
      </BackButtonContainer>
      {isDesktop && (
        <>
          <TitleContainer isDesktop={isDesktop}>
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
            {websiteButton}
          </TitleContainer>
          <Divider width={12} />
        </>
      )}

      <Iframe src={link} />
      {!isDesktop && (
        <GoToWebButtonContainer>{websiteButton}</GoToWebButtonContainer>
      )}
    </Container>
  );
}

type ContainerProps = ComponentProps<typeof Modal> & {
  isDesktop: boolean;
};

type TitleContainerProps = ViewProps & { isDesktop: boolean };

const Container = styled(Modal)<ContainerProps>`
  width: ${({ isDesktop }) => (isDesktop ? '70%' : '100%')};
  height: ${({ isDesktop }) => (isDesktop ? '100vh' : '80vh')};
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

const BackButtonContainer = styled(TouchableOpacity)`
  height: 26px;
  padding: 4px;
  justify-content: center;
  align-items: center;
  background-color: ${THEME_COLOR};
`;

const GoToWebButtonContainer = styled(View)`
  justify-content: center;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 40px;
`;
