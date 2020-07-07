import React, { CSSProperties, MouseEvent } from 'react';
import styled from 'styled-components';

import { isLocalUrl } from '../helpers';
import { FONT_SIZE_NORMAL } from '../constants/theme';
import { PURPLE_LINK } from '../constants/colors';

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
  } else if (isLocal) {
    target = target || '_self';
  }

  return (
    <StyledA
      {...otherProps}
      href={href || '#'}
      target={target}
      onClick={onPress}
      style={style}
    />
  );
}

const StyledA = styled.a`
  font-family: 'Avenir';
  font-size: ${FONT_SIZE_NORMAL};
  text-decoration: none;
  color: ${PURPLE_LINK};
  &:hover,
  &:active {
    opacity: 0.5;
  }
`;
