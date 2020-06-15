import React from 'react';
import styled, { css } from 'styled-components';

import loadingWhite from '../assets/images/loading-white.gif';
import loadingPurple from '../assets/images/loading-purple.gif';

import View from './View';
import Text from './Text';
import { WHITE } from '../constants/colors';

type IconSize = keyof typeof ICON_SIZES;
type Props = ViewProps & {
  mode?: 'default' | 'overlap';
  color?: 'purple' | 'white';
  visible?: boolean;
  size?: IconSize;
  text?: string;
};

type IconProps = {
  size: string;
};

type ContainerProps = ViewProps & { mode: 'default' | 'overlap' };
export default function LoadingIndicator(props: Props) {
  let {
    mode = 'default',
    color = 'purple',
    visible = true,
    size = 'small' as IconSize,
    text,
    ...otherProps
  } = props;

  if (visible) {
    return (
      <LoadingIndicatorContainer mode={mode} {...otherProps}>
        <Icon
          src={color === 'white' ? loadingWhite : loadingPurple}
          size={ICON_SIZES[size]}
        />
        {text ? <Text style={{ marginTop: 10 }}>{text}</Text> : null}
      </LoadingIndicatorContainer>
    );
  }
  return null;
}

const ICON_SIZES = {
  small: '25px',
  large: '100px',
};

const Icon = styled.img<IconProps>`
  object-fit: contain;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
`;

const LoadingIndicatorContainer = styled(View)<ContainerProps>`
  padding: 6px;
  align-items: center;
  justify-content: 'center';
  ${(props) =>
    props.mode === 'overlap' &&
    css`
      background-color: ${WHITE};
      opacity: 0.7;
      position: absolute;
      z-index: 5;
      width: 100%;
      height: 100%;
      justify-content: center;
      min-height: 30px;
    `}
`;
