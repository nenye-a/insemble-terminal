import React from 'react';
import styled from 'styled-components';

import { TouchableOpacity, View } from '../core-ui';
import { WHITE, HEADER_SHADOW_COLOR } from '../constants/colors';
import { NAVBAR_HEIGHT } from '../constants/theme';

import InsembleLogo from './InsembleLogo';

export default function HeaderNavigationBar() {
  return (
    <Container>
      <TouchableOpacity onPress={() => {}}>
        <InsembleLogo color="purple" />
      </TouchableOpacity>
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  height: ${NAVBAR_HEIGHT};
  background-color: ${WHITE};
  box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
  padding: 0px 32px;
  position: sticky;
  top: 0px;
  z-index: 99;
`;
