import React, { MouseEvent, forwardRef, Ref } from 'react';
import styled, { css } from 'styled-components';

import View from './View';

type PressHandler = () => void;

type Props = Omit<ViewProps, 'onClick'> & {
  onPress?: PressHandler;
  stopPropagation?: boolean;
};

export default forwardRef((props: Props, forwardedRef: Ref<HTMLDivElement>) => {
  let { onPress, href, stopPropagation, disabled, ...otherProps } = props;
  let isLink = href != null;
  let isLocalLink = isLink && isLocalURL(href);
  return (
    <Touchable
      as={isLink ? 'a' : undefined}
      href={href}
      target={isLink && !isLocalLink ? '_blank' : undefined}
      disabled={disabled}
      ref={forwardedRef}
      {...otherProps}
      onClick={(event: MouseEvent) => {
        if (stopPropagation) {
          event.stopPropagation();
        }
        if (isLocalLink && !(event.metaKey || event.ctrlKey)) {
          event.preventDefault();
        }
        if (onPress && !disabled) {
          onPress();
        }
      }}
      tabIndex={0}
    />
  );
});

let linkStyles = css`
  background-color: rgba(0, 0, 0, 0);
  color: inherit;
  text-align: inherit;
  font: inherit;
  list-style: none;
  &:hover {
    text-decoration: none;
  }
`;

const Touchable = styled(View)<ViewProps>`
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  transition-property: opacity;
  transition-duration: 0.15s;
  outline: none;
  ${(props) => (props.href == null ? undefined : linkStyles)}
  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      cursor: default;
    `}
  &:active {
    opacity: 0.5;
  }
`;

function isLocalURL(link: string) {
  let firstChar = link.charAt(0);
  // TODO: More comprehensive implementation of this?
  return firstChar === '.' || firstChar === '/';
}
