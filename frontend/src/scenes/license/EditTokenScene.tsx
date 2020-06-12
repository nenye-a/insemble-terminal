import React from 'react';
import styled from 'styled-components';

import { View } from '../../core-ui';

import MasterTokenList from './MasterTokenList';
import TokenList from './TokenList';

export default function EditTokenScene() {
  return (
    <Container>
      <MasterTokenList />
      <TokenList />
    </Container>
  );
}

const Container = styled(View)`
  padding: 40px 10%;
  justify-content: center;
  min-height: 90vh;
`;
