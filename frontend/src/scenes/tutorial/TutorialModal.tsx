import React from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';

import SideBar from './SideBar';
import TutorialContent from './TutorialContent';

export default function TutorialModal() {
  return (
    <Container visible>
      <SideBar />
      <TutorialContent />
    </Container>
  );
}

const Container = styled(Modal)`
  width: 90vw;
  flex-direction: row;
`;
