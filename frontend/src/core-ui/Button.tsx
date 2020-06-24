import React, { ComponentProps, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import {
  THEME_COLOR,
  WHITE,
  DARK_TEXT_COLOR,
  MUTED_TEXT_COLOR,
  BUTTON_BORDER_COLOR,
} from '../constants/colors';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SMALL,
} from '../constants/theme';

import TouchableOpacity from './TouchableOpacity';
import Text from './Text';
import LoadingIndicator from './LoadingIndicator';

type TextProps = ComponentProps<typeof Text>;

type Props = ComponentProps<typeof TouchableOpacity> & {
  text: string;
  textProps?: TextProps;
  mode?: 'primary' | 'secondary' | 'transparent' | 'withShadow';
  size?: 'small' | 'default';
  shape?: 'block' | 'round';
  icon?: ReactNode;
  badgeText?: string;
  loading?: boolean;
  stopPropagation?: boolean;
};

export default function Button(props: Props) {
  let {
    mode = 'primary',
    size = 'default',
    shape = 'block',
    text,
    textProps,
    icon,
    badgeText,
    loading,
    disabled,
    stopPropagation,
    ...otherProps
  } = props;
  return (
    <Container
      forwardedAs="button"
      type="button"
      disabled={loading || disabled}
      mode={mode}
      stopPropagation={stopPropagation}
      size={size}
      shape={shape}
      {...otherProps}
    >
      {loading ? (
        <LoadingIndicator color={mode === 'primary' ? 'white' : 'purple'} />
      ) : (
        <>
          <Text
            as="span"
            color="white"
            fontWeight={FONT_WEIGHT_MEDIUM}
            fontSize={FONT_SIZE_SMALL}
            {...textProps}
          >
            {text}
          </Text>
          {icon}
        </>
      )}
    </Container>
  );
}

const Container = styled(TouchableOpacity)<Props>`
  background-color: ${THEME_COLOR};
  justify-content: center;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  outline: none;
  border-radius: ${(props) =>
    props.shape === 'round' ? '14px' : DEFAULT_BORDER_RADIUS};
    height: ${(props) =>
      props.size === 'default' && props.shape === 'block' ? '36px' : '28px'};
  ${(props) =>
    props.mode === 'primary' &&
    css`
      &:disabled {
        background-color: ${MUTED_TEXT_COLOR};
      }
    `}
  ${(props) =>
    props.mode === 'secondary' &&
    css`
      background-color: ${WHITE};
      border: 0.8px solid ${BUTTON_BORDER_COLOR};
      ${Text} {
        color: ${DARK_TEXT_COLOR};
      }
    `}
  ${(props) =>
    props.mode === 'transparent' &&
    css`
      padding: 0;
      background-color: transparent;
      ${Text} {
        color: ${THEME_COLOR};
      }
      &:disabled ${Text} {
        color: ${MUTED_TEXT_COLOR};
      }
    `}
    ${(props) =>
      props.mode === 'withShadow' &&
      css`
        background-color: transparent;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
        ${Text} {
          color: ${THEME_COLOR};
        }
        &:disabled ${Text} {
          color: ${MUTED_TEXT_COLOR};
        }
      `}
  &:hover, &:not():disabled {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.5;
  }
`;
