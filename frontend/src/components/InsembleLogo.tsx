import React from 'react';
import styled from 'styled-components';

import logo from '../assets/images/insemble-logo.svg';
import whitelogo from '../assets/images/insemble-logo-white.svg';

type Size = 'small' | 'default';

type Props = {
  color: 'white' | 'purple';
  size?: Size;
};

type LogoProps = ImageProps & {
  size: Size;
};

export default function InsembleLogo(props: Props) {
  let { color, size = 'default' } = props;
  return (
    <Image
      src={color === 'white' ? whitelogo : logo}
      size={size as Size}
      alt="Insemble"
    />
  );
}

const Image = styled('img')<LogoProps>`
  height: ${(props) => (props.size === 'small' ? '18px' : '36px')};
  max-height: 100%;
`;
