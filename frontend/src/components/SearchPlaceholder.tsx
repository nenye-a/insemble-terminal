import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../core-ui';
import { FONT_SIZE_XLARGE } from '../constants/theme';
import { DARK_TEXT_COLOR } from '../constants/colors';

import SvgArrowUp from './icons/arrow-up';

export default function SearchPlaceholder() {
  return (
    <TitleRow>
      <SvgArrowUp height={26} viewBox="0 0 27 27" />
      <Title>
        Search and find performance data on retailers and restaurants
      </Title>
    </TitleRow>
  );
}

const Title = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  color: ${DARK_TEXT_COLOR};
  padding: 20px 12px;
`;

const TitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
`;
