import React, { MouseEvent, forwardRef, Ref, useState } from 'react';
import styled, { css } from 'styled-components';

import { isLocalUrl } from '../helpers';

import View from './View';

type PressHandler = () => void;

type Props = Omit<ViewProps, 'onClick'> & {
  onPress?: PressHandler;
  stopPropagation?: boolean;
};

export default forwardRef((props: Props, forwardedRef: Ref<HTMLDivElement>) => {
  let { onPress, href, stopPropagation, disabled, ...otherProps } = props;
  let isLink = href != null;
  let isLocalLink = isLink && isLocalUrl(href);
  let [metaOrCtrlActive, setMetaOrCtrlActive] = useState(false);
  return (
    <Touchable
      as={isLink ? 'a' : undefined}
      href={href}
      target={
        isLink && (!isLocalLink || metaOrCtrlActive) ? '_blank' : undefined
      }
      disabled={disabled}
      ref={forwardedRef}
      onKeyDown={(e: KeyboardEvent) => {
        if (
          (e.key === 'Enter' || e.key === 'Spacebar') &&
          onPress &&
          !disabled
        ) {
          onPress();
        }
      }}
      tabIndex={0}
      {...otherProps}
      onClick={(event: MouseEvent) => {
        if (stopPropagation) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (isLocalLink && !(event.metaKey || event.ctrlKey)) {
          event.preventDefault();
        }
        if (isLocalLink && (event.metaKey || event.ctrlKey)) {
          setMetaOrCtrlActive(true);
        } else if (onPress && !disabled) {
          onPress();
        }
      }}
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
  text-decoration: none;
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
