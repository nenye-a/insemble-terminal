import React from 'react';
import ReactGA from 'react-ga';
import styled, { css } from 'styled-components';

import { View, Text, Link as BaseLink } from '../core-ui';
import { useViewport } from '../helpers';
import { BLACK, WHITE } from '../constants/colors';
import { PRIVACY_POLICY_PDF, TERMS_OF_SERVICE_PDF } from '../constants/uri';
import { VIEWPORT_TYPE } from '../constants/viewports';
import { FONT_WEIGHT_MEDIUM, FONT_SIZE_MEDIUM } from '../constants/theme';
import {
  TERMS_OF_SERVICE_ROUTE,
  PRIVACY_POLICY_ROUTE,
} from '../constants/trackEvents';

type ViewWithViewportType = ViewProps & {
  isDesktop: boolean;
};

export default function Footer() {
  let { viewportType } = useViewport();
  let isDesktop = viewportType === VIEWPORT_TYPE.DESKTOP;

  let trackEvent = (route: string) => {
    ReactGA.pageview(route);
  };

  return (
    <Container isDesktop={isDesktop}>
      <Link
        href={PRIVACY_POLICY_PDF}
        onPress={() => {
          trackEvent(PRIVACY_POLICY_ROUTE);
        }}
      >
        {isDesktop ? 'Privacy Policy' : 'Privacy'}
      </Link>
      <Spacing />
      <Link
        href={TERMS_OF_SERVICE_PDF}
        onPress={() => {
          trackEvent(TERMS_OF_SERVICE_ROUTE);
        }}
      >
        {isDesktop ? 'Terms of Agreement' : 'Terms'}
      </Link>
      <Spacing />
      <WhiteText>© Insemble, Inc</WhiteText>
    </Container>
  );
}

const Container = styled(View)<ViewWithViewportType>`
  align-items: center;
  flex-direction: row;
  background-color: ${BLACK};
  padding: 20px 5vw;
  width: 100%;
  height: 70px;
  ${({ isDesktop }) =>
    isDesktop
      ? css`
          justify-content: flex-end;
        `
      : css`
          justify-content: center;
        `}
`;

const WhiteText = styled(Text)`
  color: ${WHITE};
  font-size: ${FONT_SIZE_MEDIUM};
`;

const Spacing = styled(View)`
  width: 80px;
`;

const Link = styled(BaseLink)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_MEDIUM};
`;
