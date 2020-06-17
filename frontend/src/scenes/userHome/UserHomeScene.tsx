import React from 'react';
import styled from 'styled-components';
import { useHistory, Redirect } from 'react-router-dom';

import { View } from '../../core-ui';
import { SearchPlaceholder, SearchFilterBar } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { WHITE } from '../../constants/colors';
import InsembleLogo from '../../components/InsembleLogo';

export default function UserHomeScene() {
  let history = useHistory();
  let { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  } else if (isAuthenticated && user && !user.license) {
    return <Redirect to="/activation" />;
  }

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
