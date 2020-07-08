import React from 'react';
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

export type BackgroundMode = keyof typeof BG_SOURCE;

type Props = ViewProps & {
  mode?: BackgroundMode;
};

export const Background = ({ mode, children, ...props }: Props) => {
  return mode ? (
    <Container {...props}>
      <Img src={BG_SOURCE[mode]} />
      {children}
    </Container>
  ) : (
    <View>{children}</View>
  );
};

const Container = styled(View)`
  background-color: ${LIGHT_PURPLE};
  width: 100vw;
  min-height: calc(100vh - ${NAVBAR_HEIGHT});
`;
const Img = styled.img`
  position: absolute;
  bottom: 0px;
  object-fit: cover;
  width: 100vw;
  height: 100vh;
  z-index: 0;
`;
