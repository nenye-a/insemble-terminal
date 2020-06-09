import React from 'react';
import styled, { css } from 'styled-components';

import { View, Text, TouchableOpacity, Link } from '../../core-ui';
import { BLACK, WHITE } from '../../constants/colors';
import {
  SUPPORT_EMAIL,
  PRIVACY_POLICY_PDF,
  TERMS_OF_SERVICE_PDF,
} from '../../constants/uri';
import { VIEWPORT_TYPE } from '../../constants/viewports';
import { useViewport } from '../../helpers';

type ViewWithViewportType = ViewProps & {
  isDesktop: boolean;
};

export default function Footer() {
  let { viewportType } = useViewport();
  let isDesktop = viewportType === VIEWPORT_TYPE.DESKTOP;

  return (
    <Container isDesktop={isDesktop}>
      <TouchableOpacity href={`mailto:${SUPPORT_EMAIL}`}>
        <WhiteText>Contact us!</WhiteText>
      </TouchableOpacity>
      <Row isDesktop={isDesktop}>
        <CopyrightContainer isDesktop={isDesktop}>
          <WhiteLink href={TERMS_OF_SERVICE_PDF}>Terms of Service</WhiteLink>
          <WhiteLink href={PRIVACY_POLICY_PDF}>Privacy Policy</WhiteLink>
        </CopyrightContainer>
        <CopyrightContainer isDesktop={isDesktop}>
          <WhiteText>@2020 Insemble</WhiteText>
          <WhiteText>Insemble Inc. All Rights Reserved.</WhiteText>
        </CopyrightContainer>
      </Row>
    </Container>
  );
}

const Row = styled(View)<ViewWithViewportType>`
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column')};
`;
const Container = styled(View)<ViewWithViewportType>`
  align-items: center;
  background-color: ${BLACK};
  padding: 20px 5vw;
  width: 100%;
  height: 140px;
  ${({ isDesktop }) =>
    isDesktop
      ? css`
          flex-direction: row;
          justify-content: space-between;
        `
      : css`
          flex-direction: column;
          justify-content: center;
        `}
`;

const CopyrightContainer = styled(View)<ViewWithViewportType>`
  ${({ isDesktop }) =>
    !isDesktop
      ? css`
          align-items: center;
          padding-top: 16px;
        `
      : css`
          align-items: flex-start;
          padding-left: 35px;
        `}
`;

const WhiteText = styled(Text)`
  color: ${WHITE};
`;

const WhiteLink = styled(Link)`
  color: ${WHITE};
`;
