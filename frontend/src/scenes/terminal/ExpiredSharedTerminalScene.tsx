import React from 'react';
import styled from 'styled-components';

import { View, Text, Link } from '../../core-ui';
import {
  FONT_WEIGHT_BOLD,
  FONT_SIZE_XLARGE,
  FONT_SIZE_SEMI_MEDIUM,
} from '../../constants/theme';
import { DARK_TEXT_COLOR, THEME_COLOR } from '../../constants/colors';
import { useViewport } from '../../helpers';

export default function ExpiredSharedTerminalScene() {
  let { isDesktop } = useViewport();
  return (
    <Container flex>
      <Title isDesktop={isDesktop}>Expired Terminal Link</Title>
      <Description isDesktop={isDesktop}>
        Unfortunately, this shared terminal link is expired. Please contact the
        sharer to receive another. If you received a link from our team, contact
        us{' '}
        <Link
          style={{
            color: THEME_COLOR,
            fontWeight: 'bold',
            fontSize: 'inherit',
          }}
          href="/contact-us"
        >
          here.
        </Link>
      </Description>
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const Title = styled(Text)<WithViewport>`
  font-weight: ${FONT_WEIGHT_BOLD};
  font-size: ${(props) => (props.isDesktop ? '50px' : FONT_SIZE_XLARGE)};
  padding-bottom: 30px;
  text-align: center;
`;

const Description = styled(Text)<WithViewport>`
  max-width: 560px;
  color: ${DARK_TEXT_COLOR};
  font-size: ${(props) => (props.isDesktop ? '20px' : FONT_SIZE_SEMI_MEDIUM)};
  text-align: center;
`;
