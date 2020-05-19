import React from 'react';
import styled from 'styled-components';

import loadingWhite from '../assets/images/loading-white.gif';
import loadingPurple from '../assets/images/loading-purple.gif';

import View from './View';
import Text from './Text';

type IconSize = keyof typeof ICON_SIZES;
type Props = ViewProps & {
  color?: 'purple' | 'white';
  visible?: boolean;
  size?: IconSize;
  text?: string;
};

type IconProps = {
  size: string;
};

export default function LoadingIndicator(props: Props) {
  let {
    color = 'purple',
    visible = true,
    size = 'small' as IconSize,
    text,
    ...otherProps
  } = props;

  if (visible) {
    return (
      <LoadingIndicatorContainer {...otherProps}>
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

const LoadingIndicatorContainer = styled(View)`
  padding: 6px;
  align-items: center;
  justify-content: 'center';
`;
