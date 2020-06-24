import React from 'react';
import styled from 'styled-components';
import { useHistory, Redirect } from 'react-router-dom';

import { View } from '../../core-ui';
import { SearchPlaceholder, SearchFilterBar } from '../../components';
import { useViewport } from '../../helpers';
import { useAuth } from '../../context/AuthContext';
import { WHITE } from '../../constants/colors';
import InsembleLogo from '../../components/InsembleLogo';
import { SearchTag } from '../../types/types';
import SearchFilterBarMobile from '../../components/SearchFilterBarMobile';

export default function UserHomeScene() {
  let history = useHistory();
  let { isAuthenticated, user } = useAuth();
  let { isDesktop } = useViewport();

  let onSearchPress = (search: SearchTag) => {
    history.push('/results', { search });
  };
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  } else if (isAuthenticated && user && !user.license) {
    return <Redirect to="/activation" />;
  }

  return (
    <Container isDesktop={isDesktop}>
      <InsembleLogo color="purple" size="big" />
      <SearchBarContainer>
        {isDesktop ? (
          <SearchFilterBar onSearchPress={onSearchPress} />
        ) : (
          <SearchFilterBarMobile focus={true} onSearchPress={onSearchPress} />
        )}
      </SearchBarContainer>
      {isDesktop && <SearchPlaceholder />}
    </Container>
  );
}

const Container = styled(View)<ViewProps & WithViewport>`
  height: 90vh;
  width: 100vw;
  padding: ${(props) => (props.isDesktop ? '0 15% 24px 15%' : '24px')};
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
