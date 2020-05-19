import React from 'react';
import styled from 'styled-components';

import { TouchableOpacity, View, Button } from '../core-ui';
import {
  WHITE,
  HEADER_SHADOW_COLOR,
  DARK_TEXT_COLOR,
} from '../constants/colors';
import { NAVBAR_HEIGHT } from '../constants/theme';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';
import ProfileMenuDropdown from './ProfileMenuDropdown';

export default function HeaderNavigationBar() {
  let loggedIn = true; // TODO: change when connecting to BE
  return (
    <Container>
      <TouchableOpacity onPress={() => {}}>
        <InsembleLogo color="purple" />
      </TouchableOpacity>
      <SearchFilterBar />
      {loggedIn ? (
        <Row>
          <TerminalButton
            mode="transparent"
            text="Terminals"
            textProps={{ style: { color: DARK_TEXT_COLOR } }}
          />
          <ProfileMenuDropdown name="Nia" email="nia@kodefox.com" />
        </Row>
      ) : (
        <Row>
          <Button shape="round" mode="secondary" text="Sign in" />
          <SignUpButton shape="round" text="Sign up" />
        </Row>
      )}
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 100vw;
  height: ${NAVBAR_HEIGHT};
  background-color: ${WHITE};
  box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
  padding: 0px 32px;
  position: sticky;
  top: 0px;
  z-index: 99;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const SignUpButton = styled(Button)`
  margin-left: 8px;
`;

const TerminalButton = styled(Button)`
  margin-right: 8px;
`;
