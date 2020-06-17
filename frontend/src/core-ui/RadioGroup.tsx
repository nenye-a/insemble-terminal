import React, { ComponentProps } from 'react';
import styled from 'styled-components';

import { FONT_SIZE_SMALL } from '../constants/theme';
import { RED_TEXT } from '../constants/colors';
import { useID, isEqual } from '../helpers';

import View from './View';
import RadioButton from './RadioButton';
import Text from './Text';
import Label from './Label';

type ViewProps = ComponentProps<typeof View>;

type RadioGroupProps<T> = ViewProps & {
  name?: string;
  options: Array<T>;
  selectedOption?: T;
  titleExtractor?: (item: T) => string;
  keyExtractor?: (item: T, index: number) => string;
  onSelect: (item: T) => void;
  radioItemProps?: ViewProps;
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  labelProps?: TextProps;
  required?: boolean;
};

const defaultTitleExtractor = (item: unknown) => String(item);
const defaultKeyExtractor = (item: unknown, index: number) => String(index);

export default function RadioGroup<T>(props: RadioGroupProps<T>) {
  let {
    name: providedName,
    options,
    selectedOption,
    titleExtractor = defaultTitleExtractor,
    keyExtractor = defaultKeyExtractor,
    onSelect,
    radioItemProps,
    label,
    disabled = false,
    errorMessage,
    labelProps,
    required,
    ...otherProps
  } = props;
  let fallbackName = useID();

  let name = providedName || fallbackName;
  return (
    <View {...otherProps}>
      <Row>
        {label && <LabelWrapper id={name} text={label} />}
        {required && (
          <LabelWrapper
            text="*required"
            color={RED_TEXT}
            style={{ marginLeft: 8 }}
          />
        )}
      </Row>

      {options.map((item, i) => {
        let key = keyExtractor(item, i);
        return (
          <RadioButton
            key={key}
            name={name}
            id={name + '_' + key}
            title={titleExtractor(item)}
            isSelected={isEqual(item, selectedOption)}
            onPress={() => onSelect(item)}
            disabled={disabled}
            labelProps={labelProps}
            {...radioItemProps}
          />
        );
      })}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </View>
  );
}

const LabelWrapper = styled(Label)`
  padding-bottom: 8px;
`;

const ErrorMessage = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  color: ${RED_TEXT};
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;
