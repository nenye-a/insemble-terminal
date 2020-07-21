import React, {
  ComponentProps,
  useState,
  CSSProperties,
  ReactNode,
} from 'react';
import styled, { css } from 'styled-components';

import SvgCheck from '../components/icons/check';
import {
  THEME_COLOR,
  WHITE,
  DEFAULT_TEXT_COLOR,
  BACKGROUND_COLOR,
  BORDER_COLOR,
  LIGHT_GRAY,
} from '../constants/colors';
import { FONT_SIZE_NORMAL } from '../constants/theme';
import { useID } from '../helpers';

import View from './View';
import Label from './Label';

type CheckboxProps = ViewProps & {
  isChecked: boolean;
  onPress: () => void;
  title?: string | ReactNode;
  titleProps?: TextProps;
  size?: string;
  iconContainerStyle?: CSSProperties;
  color?: string;
  disabled?: boolean;
};

type ContainerProps = ViewProps & {
  isFocused: boolean;
};

type CheckProps = ComponentProps<typeof SvgCheck> & {
  isVisible: boolean;
  disabled?: boolean;
  color: string;
};

const SIZE = '18px';
const BORDER_RADIUS = '5px';

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

type BackdropProps = ViewProps & {
  disabled: boolean;
};

const Container = styled(View)<ContainerProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-radius: ${BORDER_RADIUS};
  ${(props) => (props.isFocused ? focusedStyles : undefined)};
`;

const RowedView = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Backdrop = styled(View)<BackdropProps>`
  ${fillContainer};
  background-color: ${WHITE};
  border: 1px solid ${(props) => props.color};
  border-radius: ${BORDER_RADIUS};
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${BACKGROUND_COLOR};
      border-color: ${BORDER_COLOR};
    `}
`;

const Check = styled(SvgCheck)<CheckProps>`
  ${fillContainer};
  color: ${WHITE};
  background-color: ${(props) => props.color};
  border-radius: ${BORDER_RADIUS};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 150ms linear;
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${LIGHT_GRAY};
    `}
`;

const NativeCheckbox = styled.input.attrs(() => ({ type: 'checkbox' }))`
  margin: 0;
  border: 0;
  padding: 0;
  display: block;
  box-sizing: border-box;
  opacity: 0;
  cursor: pointer;
  ${fillContainer};
`;

const LabelText = styled(Label)`
  margin-left: 12px;
  font-size: ${FONT_SIZE_NORMAL};
  color: ${DEFAULT_TEXT_COLOR};
`;

export default function Checkbox(props: CheckboxProps) {
  let {
    isChecked,
    onPress,
    title,
    titleProps,
    size = SIZE,
    iconContainerStyle,
    color = THEME_COLOR,
    disabled,
    ...otherProps
  } = props;
  let [isFocused, setFocus] = useState(false);

  let id = useID();
  return (
    <RowedView {...otherProps}>
      <Container isFocused={isFocused} size={size} style={iconContainerStyle}>
        <Backdrop color={color} disabled={disabled} />
        <Check color={color} isVisible={isChecked} disabled={disabled} />
        <NativeCheckbox
          id={id}
          checked={isChecked}
          disabled={disabled}
          onClick={() => onPress()}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
      </Container>
      {typeof title === 'string' ? (
        <LabelText text={title} id={id} {...titleProps} />
      ) : (
        title
      )}
    </RowedView>
  );
}
