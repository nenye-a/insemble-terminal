import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';
import { BACKGROUND_COLOR } from '../../constants/colors';

import OverviewContent from './OverviewContent';
// import ActivityContent from './ActivityContent';

export default function TutorialContent() {
  return (
    <Container flex>
      <OverviewContent />
      {/* <ActivityContent /> */}
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${BACKGROUND_COLOR};
  overflow-y: scroll;
  padding: 27px;
`;
