import React, { ComponentProps, forwardRef, Ref } from 'react';
import styled, { css, CSSProperties } from 'styled-components';

import {
  DEFAULT_TEXT_COLOR,
  TEXT_INPUT_BORDER_COLOR,
  DISABLED_TEXT_INPUT_BACKGROUND,
  MUTED_TEXT_COLOR,
  RED_TEXT,
  THEME_COLOR,
} from '../constants/colors';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_FAMILY_NORMAL,
  FONT_SIZE_NORMAL,
  FONT_SIZE_SMALL,
} from '../constants/theme';
import { useID } from '../helpers';

import Label from './Label';
import View from './View';
import Text from './Text';

type Props = ComponentProps<'textarea'> & {
  label?: string;
  characterLimit?: number;
  showCharacterLimit?: boolean;
  values?: string;
  containerStyle?: CSSProperties;
  errorMessage?: string;
};

export default forwardRef(
  (props: Props, forwardedRef: Ref<HTMLTextAreaElement>) => {
    let {
      id: providedID,
      values,
      defaultValue,
      label,
      characterLimit = 500,
      showCharacterLimit,
      containerStyle,
      errorMessage,
      ...otherProps
    } = props;
    let remainingCharacters =
      characterLimit - (values?.length || defaultValue?.toString().length || 0);
    let generatedID = useID();
    let id = providedID || generatedID;
    let isError = !!errorMessage;
    return (
      <View style={containerStyle}>
        <RowedView>
          {label ? (
            <Label
              color={isError ? RED_TEXT : THEME_COLOR}
              id={id}
              text={label}
              style={{ fontSize: FONT_SIZE_NORMAL }}
            />
          ) : (
            <View />
          )}
          {showCharacterLimit && (
            <RemainingCharacters
              text={`${remainingCharacters} characters left`}
            />
          )}
        </RowedView>
        <TextAreaBox
          {...otherProps}
          id={id}
          defaultValue={defaultValue}
          ref={forwardedRef}
          maxLength={characterLimit}
          value={values}
          {...(isError && { style: { borderColor: RED_TEXT } })}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </View>
    );
  },
);

const RowedView = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 8px;
`;

const TextAreaBox = styled.textarea`
  padding: 8px 12px;
  color: ${DEFAULT_TEXT_COLOR};
  border: solid 1px ${TEXT_INPUT_BORDER_COLOR};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  display: block;
  width: 100%;
  height: 147px;
  box-sizing: border-box;
  font-family: ${FONT_FAMILY_NORMAL};
  font-size: ${FONT_SIZE_NORMAL};
  ${(props) =>
    props.disabled &&
    css`
      background-color: ${DISABLED_TEXT_INPUT_BACKGROUND};
    `}
`;

const RemainingCharacters = styled(Label)`
  font-style: italic;
  color: ${MUTED_TEXT_COLOR};
`;

const ErrorMessage = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  color: ${RED_TEXT};
  margin-top: 6px;
`;
