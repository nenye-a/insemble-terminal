import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';
import { BACKGROUND_COLOR } from '../../constants/colors';
import { useTutorialContext } from '../../context';

import OverviewContent from './OverviewContent';
import ActivityContent from './ActivityContent';
import MapContent from './MapContent';
import PerformanceContent from './PerformanceContent';
import NewsContent from './NewsContent';
import ContactsContent from './ContactsContent';
import PersonalTerminalContent from './PersonalTerminalContent';

export default function TutorialContent() {
  let { selectedPage } = useTutorialContext();

  return (
    <Container flex>
      {selectedPage === 'overview' ? (
        <OverviewContent />
      ) : selectedPage === 'performance' ? (
        <PerformanceContent />
      ) : selectedPage === 'activity' ? (
        <ActivityContent />
      ) : selectedPage === 'map' ? (
        <MapContent />
      ) : selectedPage === 'news' ? (
        <NewsContent />
      ) : selectedPage === 'contacts' ? (
        <ContactsContent />
      ) : selectedPage === 'terminal' ? (
        <PersonalTerminalContent />
      ) : null}
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${BACKGROUND_COLOR};
  overflow-y: scroll;
  padding: 27px;
`;
