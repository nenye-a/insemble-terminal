import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { Background, HeaderNavigationBar } from '../../components';
import { FONT_WEIGHT_BOLD, FONT_SIZE_SEMI_MEDIUM } from '../../constants/theme';
import { DARK_TEXT_COLOR } from '../../constants/colors';
import { useViewport } from '../../helpers';

export default function NotFoundScene() {
  let { isDesktop } = useViewport();
  return (
    <Background mode={isDesktop ? 'quarterPurple' : 'halfPurple'}>
      <HeaderNavigationBar mode="transparent" />
      <Container flex>
        <Title>404</Title>
        <Description isDesktop={isDesktop}>
          The webpage you are looking for was not found, please double check the
          link.
        </Description>
      </Container>
    </Background>
  );
}

const Container = styled(View)`
  padding: 24px;
  justify-content: center;
  align-items: center;
  min-height: 95vh;
`;

const Title = styled(Text)<WithViewport>`
  font-weight: ${FONT_WEIGHT_BOLD};
  font-size: 80px;
  padding-bottom: 30px;
  text-align: center;
`;

const Description = styled(Text)<WithViewport>`
  color: ${DARK_TEXT_COLOR};
  font-size: ${(props) => (props.isDesktop ? '20px' : FONT_SIZE_SEMI_MEDIUM)};
  max-width: 100vw;
  text-align: center;
`;
