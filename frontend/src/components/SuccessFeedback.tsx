import React from 'react';
import styled from 'styled-components';

import { Card, Text } from '../core-ui';
import { useViewport } from '../helpers';
import { THEME_COLOR } from '../constants/colors';

import SvgRoundCheck from './icons/round-check';

type Props = ViewProps;

export default function SuccessFeedback({ children, ...otherProps }: Props) {
  let { isDesktop } = useViewport();
  return (
    <Container isDesktop={isDesktop} {...otherProps}>
      <SvgRoundCheck style={{ color: THEME_COLOR }} />
      <Title>Thank you!</Title>
      {children}
    </Container>
  );
}

const Container = styled(Card)<WithViewport>`
  padding: 30px;
  width: ${(props) => (props.isDesktop ? '560px' : '100%')};
  align-items: center;
`;

const Title = styled(Text)`
  font-size: 35px;
  padding: 10px 0;
`;
