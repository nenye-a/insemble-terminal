import React from 'react';
import styled, { css } from 'styled-components';

import { THEME_COLOR } from '../constants/colors';

import View from './View';

type Props = ViewProps & {
  mode?: 'horizontal' | 'vertical';
  color?: string;
  width?: number;
};

export default function Divider(props: Props) {
  let { mode = 'horizontal', color, width = 1, ...otherProps } = props;

  return (
    <StyledDivider mode={mode} color={color} width={width} {...otherProps} />
  );
}

const StyledDivider = styled(View)<Props>`
  ${({ mode, width }) =>
    mode === 'horizontal'
      ? css`
          height: ${width}px;
        `
      : css`
          width: ${width}px;
        `}
        background-color: ${({ color }) => color || THEME_COLOR}
`;
