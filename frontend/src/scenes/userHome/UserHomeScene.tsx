import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { View } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import InsembleLogo from '../../components/InsembleLogo';
import { SearchPlaceholder, SearchFilterBar } from '../../components';

export default function UserHomeScene() {
  let history = useHistory();
  return (
    <Container>
      <InsembleLogo color="purple" size="big" />
      <SearchBarContainer>
        <SearchFilterBar
          onSearchPress={(search) => {
            history.push('/results', { search });
          }}
        />
      </SearchBarContainer>
      <SearchPlaceholder />
    </Container>
  );
}

const Container = styled(View)`
  height: 90vh;
  width: 100vw;
  padding: 0 15% 24px 15%;
  justify-content: center;
  align-items: center;
  margin-top: -24px;
`;

const SearchBarContainer = styled(View)`
  padding: 24px;
  margin: 24px 0 42px 0;
  background-color: ${WHITE};
  width: 100%;
  z-index: 99;
`;
