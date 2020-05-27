import React from 'react';
import styled, { css } from 'styled-components';

import {
  DEFAULT_TEXT_COLOR,
  THEME_COLOR,
  WHITE,
  DISABLED_PILL_COLOR,
} from '../constants/colors';
import {
  FONT_FAMILY_NORMAL,
  FONT_SIZE_NORMAL,
  DEFAULT_BORDER_RADIUS,
} from '../constants/theme';

import View from './View';

type PillProps = ViewProps & {
  primary?: boolean;
  onPress?: () => void;
  children: string;
  disabled?: boolean;
};

export default function Pill(props: PillProps) {
  let {
    primary = true,
    onPress,
    children,
    disabled = false,
    ...otherProps
  } = props;
  if (onPress) {
    return (
      <PressPill
        primary={primary}
        onClick={onPress}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </PressPill>
    );
  }
  return (
    <DefaultPill primary={primary} disabled={disabled} {...otherProps}>
      {children}
    </DefaultPill>
  );
}

const defaultPillStyle = css`
  font-size: ${FONT_SIZE_NORMAL};
  height: 28px;
  min-height: 28px;
  /* So the size doesn't slightly change when purple border shows up when highlighted */
  border: 1px solid;
  border-color: ${WHITE};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: 0 0 0.35rem rgba(0, 0, 0, 0.15);
  background: ${WHITE};
  color: ${DEFAULT_TEXT_COLOR};
  font-family: ${FONT_FAMILY_NORMAL};
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
`;

const DefaultPill = styled(View)<PillProps>`
  padding: 4px;
  ${defaultPillStyle};
  ${(props: PillProps) =>
    props.primary &&
    css`
      background: ${THEME_COLOR};
      border-color: ${THEME_COLOR};
      color: ${WHITE};
    `}
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${DISABLED_PILL_COLOR};
      border-color: ${DISABLED_PILL_COLOR};
    `}
`;

const PressPill = styled.button.attrs(() => ({ type: 'button' }))<PillProps>`
  cursor: pointer;
  &:hover {
    color: ${THEME_COLOR};
    border-color: ${THEME_COLOR};
    box-shadow: 0 0.25rem 0.35rem rgba(0, 0, 0, 0.15);
  }
  ${defaultPillStyle};
  ${(props: PillProps) =>
    props.primary &&
    css`
      background: ${THEME_COLOR};
      color: ${WHITE};
      border-color: ${THEME_COLOR};

      &:hover {
        color: ${WHITE};
        box-shadow: 0 0.25rem 0.45rem rgba(0, 0, 0, 0.35);
      }
    `}
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${DISABLED_PILL_COLOR};
      border-color: ${DISABLED_PILL_COLOR};
    `}
`;
