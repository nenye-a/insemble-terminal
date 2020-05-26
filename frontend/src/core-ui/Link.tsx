import React, { CSSProperties, MouseEvent } from 'react';
import styled from 'styled-components';

import { isLocalUrl } from '../helpers';
import { FONT_SIZE_NORMAL } from '../constants/theme';
import { LINK_COLOR } from '../constants/colors';

type Props = TextProps & {
  href?: string;
  target?: '_blank' | '_top' | '_self';
  onPress?: (event: MouseEvent) => void;
  style?: CSSProperties;
};

export default function Link(props: Props) {
  let { href = '', target, style, ...otherProps } = props;
  let isLocal = isLocalUrl(href);
  let onPress = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isLocal && target == null) {
      event.preventDefault();
    }
    if (props.onPress) {
      props.onPress(event);
    }
  };
  if (!isLocal) {
    target = target || '_blank';
  }

  return (
    <StyledA
      {...otherProps}
      href={href || '#'}
      target={target}
      onClick={onPress}
    />
  );
}

const StyledA = styled.a`
  font-family: 'Avenir';
  font-size: ${FONT_SIZE_NORMAL};
  text-decoration: none;
  color: ${LINK_COLOR};
  &:hover,
  &:active {
    opacity: 0.5;
  }
`;
