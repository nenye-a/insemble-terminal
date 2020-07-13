import React, { useRef, useEffect } from 'react';
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
  let contentContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo({ top: 0 });
    }
  }, [selectedPage]);

  return (
    <Container flex ref={contentContainerRef}>
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
