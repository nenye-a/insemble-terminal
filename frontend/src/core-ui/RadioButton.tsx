import React, { ComponentProps, useState, forwardRef, Ref } from 'react';
import styled, { css } from 'styled-components';

import {
  THEME_COLOR,
  WHITE,
  BACKGROUND_COLOR,
  BORDER_COLOR,
} from '../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';

import View from './View';
import Text from './Text';

type ViewProps = ComponentProps<typeof View>;

type Props = ViewProps & {
  name: string;
  title: string;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
  labelProps?: TextProps;
};

type RadioContainerProps = ViewProps & {
  isFocused: boolean;
};

type StyledRadioProps = ViewProps & {
  isVisible: boolean;
  disabled: boolean;
};

type BackdropProps = ViewProps & {
  disabled: boolean;
};

const SIZE = 18;
const BORDER_RADIUS = SIZE / 2;

const fillContainer = css`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const focusedStyles = css`
  box-shadow: 0 0 0.35rem rgba(0, 0, 0, 0.15);
`;

const RadioContainer = styled(View)<RadioContainerProps>`
  width: ${SIZE}px;
  height: ${SIZE}px;
  border-radius: ${BORDER_RADIUS}px;
  ${(props) => (props.isFocused ? focusedStyles : undefined)}
`;

const Backdrop = styled(View)<BackdropProps>`
  ${fillContainer};
  background-color: ${WHITE};
  border: 1px solid ${THEME_COLOR};
  border-radius: ${BORDER_RADIUS}px;
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${BACKGROUND_COLOR};
      border-color: ${BORDER_COLOR};
    `}
`;

const StyledRadio = styled(View)<StyledRadioProps>`
  ${fillContainer};
  background-color: ${WHITE};
  background-clip: padding-box;
  border: 5px solid ${THEME_COLOR};
  border-radius: ${BORDER_RADIUS}px;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 150ms linear;
  ${({ disabled, isVisible }) =>
    disabled &&
    isVisible &&
    css`
      border: 1px solid ${THEME_COLOR};
      border-color: ${BORDER_COLOR};
      background-color: ${BORDER_COLOR};
    `}
`;

const NativeRadio = styled.input.attrs(() => ({ type: 'radio' }))`
  margin: 0;
  border: 0;
  padding: 0;
  display: block;
  box-sizing: border-box;
  opacity: 0;
  cursor: pointer;
  ${fillContainer};
  ${(props) =>
    props.disabled &&
    css`
      cursor: default;
    `}
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  line-height: 2;
`;

const TextLabel = styled(Text)`
  padding-left: 12px;
  /* Adding padding-top to make it look more centered */
  padding-top: 1px;
  cursor: pointer;
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;

export default forwardRef(
  (props: Props, forwardedRef: Ref<HTMLInputElement>) => {
    let {
      name,
      value,
      id,
      title,
      isSelected,
      onPress,
      disabled,
      labelProps,
      ...otherProps
    } = props;
    let [isFocused, setFocus] = useState(false);
    return (
      <Row {...otherProps}>
        <RadioContainer isFocused={isFocused}>
          <Backdrop disabled={disabled} />
          <StyledRadio isVisible={isSelected} disabled={disabled} />
          <NativeRadio
            id={id}
            name={name}
            checked={isSelected}
            onChange={onPress}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            disabled={disabled}
            value={title}
            ref={forwardedRef}
          />
        </RadioContainer>
        <TextLabel as="label" htmlFor={id} {...labelProps}>
          {title}
        </TextLabel>
      </Row>
    );
  },
);
