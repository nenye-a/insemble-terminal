import React from 'react';
import styled from 'styled-components';

import { TouchableOpacity, View } from '../core-ui';
import { WHITE, HEADER_SHADOW_COLOR } from '../constants/colors';
import { NAVBAR_HEIGHT } from '../constants/theme';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';

export default function HeaderNavigationBar() {
  return (
    <Container>
      <TouchableOpacity onPress={() => {}}>
        <InsembleLogo color="purple" />
      </TouchableOpacity>
      <SearchFilterBar />
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
