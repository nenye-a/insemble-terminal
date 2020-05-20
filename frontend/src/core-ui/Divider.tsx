import React from 'react';
import styled, { css } from 'styled-components';

import { THEME_COLOR } from '../constants/colors';

import View from './View';

type Props = ViewProps & {
  mode?: 'horizontal' | 'vertical';
  color?: string;
};

export default function Divider(props: Props) {
  let { mode = 'horizontal', color, ...otherProps } = props;

  return <StyledDivider mode={mode} color={color} {...otherProps} />;
}

const StyledDivider = styled(View)<Props>`
  ${({ mode }) =>
    mode === 'horizontal'
      ? css`
          height: 1px;
        `
      : css`
          width: 1px;
        `}
        background-color: ${({ color }) => color || THEME_COLOR}
`;
