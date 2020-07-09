import React, { useState } from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';
import { TutorialContextProvider } from '../../context';

import SideBar from './SideBar';
import TutorialContent from './TutorialContent';

export default function TutorialModal() {
  // TODO: better typing for selectedPage
  let [selectedPage, setSelectedPage] = useState('overview');

  return (
    <TutorialContextProvider
      value={{ selectedPage, onPageChange: setSelectedPage }}
    >
      <Container visible>
        <SideBar />
        <TutorialContent />
      </Container>
    </TutorialContextProvider>
  );
}

const Container = styled(Modal)`
  width: 90vw;
  flex-direction: row;
`;
