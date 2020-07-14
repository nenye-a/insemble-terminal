import React from 'react';
import styled from 'styled-components';

import { View, Text, Button } from '../core-ui';
import { ERROR_COMPONENT_BACKGROUND, WHITE } from '../constants/colors';
import { FONT_WEIGHT_MEDIUM, DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { formatGraphQLError } from '../helpers';

type Props = {
  text?: string;
  onRetry?: () => void;
};

export default function ErrorComponent(props: Props) {
  let {
    text = 'Something went wrong. Please check your search, or try again.',
    onRetry,
  } = props;
  let formattedText = formatGraphQLError(text);
  return (
    <Container>
      <ErrorMessage>{formattedText}</ErrorMessage>
      {onRetry && <Button text="Try Again" onPress={onRetry} />}
    </Container>
  );
}

const Container = styled(View)`
  padding: 6px 26px 6px 40px;
  background-color: ${ERROR_COMPONENT_BACKGROUND};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
`;

const ErrorMessage = styled(Text)`
  color: ${WHITE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
