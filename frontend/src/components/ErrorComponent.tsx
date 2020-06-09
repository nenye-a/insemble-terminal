import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../core-ui';
import { ERROR_COMPONENT_BACKGROUND, WHITE } from '../constants/colors';
import { FONT_WEIGHT_MEDIUM, DEFAULT_BORDER_RADIUS } from '../constants/theme';

type Props = {
  text?: string;
};

export default function ErrorComponent(props: Props) {
  let {
    text = 'Something went wrong. Please check your search, or try again.',
  } = props;
  return (
    <Container>
      <ErrorMessage>{text}</ErrorMessage>
    </Container>
  );
}

const Container = styled(View)`
  padding: 10px 40px;
  background-color: ${ERROR_COMPONENT_BACKGROUND};
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const ErrorMessage = styled(Text)`
  color: ${WHITE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
