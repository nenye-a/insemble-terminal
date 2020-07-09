import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';
import { BACKGROUND_COLOR } from '../../constants/colors';

import OverviewContent from './OverviewContent';

export default function TutorialContent() {
  return (
    <Container flex>
      <OverviewContent />
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${BACKGROUND_COLOR};
  overflow-y: scroll;
  padding: 27px;
`;
