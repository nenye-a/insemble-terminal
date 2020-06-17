import React, { CSSProperties } from 'react';
import styled from 'styled-components';

import logo from '../assets/images/insemble-logo.svg';
import whitelogo from '../assets/images/insemble-logo-white.svg';

const Size = {
  small: '18px',
  default: '36px',
  big: '70px',
};

type SizeType = keyof typeof Size;
type Props = {
  color: 'white' | 'purple';
  size?: SizeType;
  style?: CSSProperties;
};

type LogoProps = {
  size: SizeType;
};

export default function InsembleLogo(props: Props) {
  let { color, size = 'default', ...otherProps } = props;
  return (
    <Image
      src={color === 'white' ? whitelogo : logo}
      size={size as SizeType}
      alt="Insemble"
      {...otherProps}
    />
  );
}

const Image = styled('img')<LogoProps>`
  height: ${(props) => Size[props.size]};
  max-height: 100%;
`;
