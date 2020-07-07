import React, { SVGProps } from 'react';
import styled from 'styled-components';

import { View } from '../core-ui';
import { NAVBAR_HEIGHT } from '../constants/theme';
import { LIGHT_PURPLE } from '../constants/colors';
import withBubbleBackground from '../assets/images/curve-background-bubble.svg';
import halfPurpleBackground from '../assets/images/curve-background.svg';
import quarterPurpleBackground from '../assets/images/quarter-curve-background.svg';

const BG_SOURCE = {
  halfPurple: halfPurpleBackground,
  quarterPurple: quarterPurpleBackground,
  withBubble: withBubbleBackground,
};

type Props = ViewProps & {
  mode?: keyof typeof BG_SOURCE;
};

const BackgroundBubble = ({
  mode = 'halfPurple',
  children,
  ...props
}: Props) => (
  <Container {...props}>
    <Img src={BG_SOURCE[mode]} />
    {children}
  </Container>
);

const Container = styled(View)`
  background-color: ${LIGHT_PURPLE};
  overflow: hidden;
  min-height: 90vh;
`;
const Img = styled.img`
  position: absolute;
  bottom: -60px;
  object-fit: cover;
  height: 100%;
  z-index: 0;
`;

export default BackgroundBubble;
