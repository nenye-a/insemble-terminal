import React from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';

import SideBar from './SideBar';

export default function TutorialModal() {
  return (
    <Container visible>
      <SideBar />
    </Container>
  );
}

const Container = styled(Modal)`
  width: 90vw;
  flex-direction: row;
`;
