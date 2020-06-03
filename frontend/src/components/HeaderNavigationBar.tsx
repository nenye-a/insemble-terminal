import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { TouchableOpacity, View, Button } from '../core-ui';
import {
  WHITE,
  HEADER_SHADOW_COLOR,
  DARK_TEXT_COLOR,
} from '../constants/colors';
import { useAuth } from '../context';
import { SearchVariables } from '../generated/Search';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';
import ProfileMenuDropdown from './ProfileMenuDropdown';

type Props = {
  onSearchPress?: (searchTags: SearchVariables) => void;
  showSearchBar?: boolean;
};

export default function HeaderNavigationBar(props: Props) {
  let { onSearchPress, showSearchBar = false } = props;
  let history = useHistory();
  let { isAuthenticated } = useAuth();

  return (
    <Container>
      <TouchableOpacity onPress={() => {}}>
        <InsembleLogo color="purple" />
      </TouchableOpacity>
      {showSearchBar && (
        <SearchContainer>
          <SearchFilterBar onSearchPress={onSearchPress} />
        </SearchContainer>
      )}
      {isAuthenticated ? (
        <RowEnd flex>
          <TerminalButton
            mode="transparent"
            text="Terminals"
            textProps={{ style: { color: DARK_TEXT_COLOR } }}
            onPress={() => {
              history.push('/terminals');
            }}
          />
          <ProfileMenuDropdown />
        </RowEnd>
      ) : (
        <RowEnd flex>
          <Button
            shape="round"
            mode="secondary"
            text="Sign in"
            onPress={() => {
              history.push('/login');
            }}
          />
          <SignUpButton
            shape="round"
            text="Sign up"
            onPress={() => {
              history.push('/signup');
            }}
          />
        </RowEnd>
      )}
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 100vw;
  background-color: ${WHITE};
  box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
  padding: 12px 32px;
  position: sticky;
  top: 0px;
  z-index: 99;
`;

const RowEnd = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const SignUpButton = styled(Button)`
  margin-left: 8px;
`;

const TerminalButton = styled(Button)`
  margin-right: 8px;
`;

const SearchContainer = styled(View)`
  margin-left: 64px;
`;
