import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { THEME_COLOR } from '../../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';

type Props = {
  title: string;
};

export default function ResultTitle(props: Props) {
  let { title } = props;
  return (
    <Container>
      <Title>{title}</Title>
      {/* TODO: add compare & pin icon */}
    </Container>
  );
}

const Container = styled(View)`
  padding: 8px 0;
  flex-direction: row;
`;

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;
