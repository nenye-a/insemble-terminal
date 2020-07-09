import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';
import { BACKGROUND_COLOR } from '../../constants/colors';
import { useTutorialContext } from '../../context';

import OverviewContent from './OverviewContent';
import ActivityContent from './ActivityContent';

export default function TutorialContent() {
  let { selectedPage } = useTutorialContext();

  return (
    <Container flex>
      {selectedPage === 'overview' ? (
        <OverviewContent />
      ) : selectedPage === 'activity' ? (
        <ActivityContent />
      ) : null}
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${BACKGROUND_COLOR};
  overflow-y: scroll;
  padding: 27px;
`;
