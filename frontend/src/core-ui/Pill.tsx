import React from 'react';
import styled, { css } from 'styled-components';

import {
  DEFAULT_TEXT_COLOR,
  THEME_COLOR,
  WHITE,
  DISABLED_PILL_COLOR,
  SHADOW_COLOR,
  MEDIUM_PURPLE,
} from '../constants/colors';
import {
  FONT_FAMILY_NORMAL,
  FONT_SIZE_NORMAL,
  FONT_WEIGHT_MEDIUM,
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
  border-radius: ${DEFAULT_BORDER_RADIUS};
  background: ${WHITE};
  color: ${DEFAULT_TEXT_COLOR};
  font-family: ${FONT_FAMILY_NORMAL};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
`;

const primaryPillStyle = css`
  background-color: ${THEME_COLOR};
  border-color: ${THEME_COLOR};
  color: ${WHITE};
`;
const secondaryPillStyle = css`
  border-color: ${WHITE};
  box-shadow: ${SHADOW_COLOR};
`;

const DefaultPill = styled(View)<PillProps>`
  padding: 4px;
  ${defaultPillStyle};
  ${(props: PillProps) =>
    props.primary ? primaryPillStyle : secondaryPillStyle};
  &:disabled {
    background-color: ${DISABLED_PILL_COLOR};
    border-color: ${DISABLED_PILL_COLOR};
    color: ${WHITE};
  }
`;

const PressPill = styled.button.attrs(() => ({ type: 'button' }))<PillProps>`
  ${defaultPillStyle};
  ${(props: PillProps) =>
    props.primary ? primaryPillStyle : secondaryPillStyle};
  cursor: pointer;
  outline: none;
  &:hover {
    box-shadow: '0px 0px 6px 0px rgba(0, 0, 0, 0.9)';
    background-color: ${THEME_COLOR};
    border-color: ${THEME_COLOR};
    color: ${WHITE};
  }
  &:active {
    border-color: ${THEME_COLOR};
    background-color: ${MEDIUM_PURPLE};
  }
  &:disabled {
    background-color: ${DISABLED_PILL_COLOR};
    border-color: ${DISABLED_PILL_COLOR};
    color: ${WHITE};
  }
`;
