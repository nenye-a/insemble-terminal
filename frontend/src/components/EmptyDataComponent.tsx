import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../core-ui';
import { EMPTY_COMPONENT_BACKGROUND, WHITE } from '../constants/colors';
import { FONT_WEIGHT_MEDIUM, DEFAULT_BORDER_RADIUS } from '../constants/theme';

type Props = {
  text?: string;
};

export default function EmptyDataComponent(props: Props) {
  let { text = 'No Data Available for this search' } = props;
  return (
    <Container>
      <ErrorMessage>{text}</ErrorMessage>
    </Container>
  );
}

const Container = styled(View)`
  padding: 10px 40px;
  background-color: ${EMPTY_COMPONENT_BACKGROUND};
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const ErrorMessage = styled(Text)`
  color: ${WHITE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
