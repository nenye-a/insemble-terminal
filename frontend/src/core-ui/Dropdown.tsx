import React, { useState, useEffect, ComponentProps, ReactNode } from 'react';
import { useCombobox } from 'downshift';
import styled, { css } from 'styled-components';

import {
  HIGHLIGHTED_DROPDOWN,
  WHITE,
  BACKGROUND_COLOR,
  SHADOW_COLOR,
  THEME_COLOR,
  DISABLED_PILL_COLOR,
  GRAY_TEXT,
} from '../constants/colors';
import {
  FONT_SIZE_NORMAL,
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
} from '../constants/theme';
import { useViewport } from '../helpers';

import TextInput from './TextInput';
import TouchableOpacity from './TouchableOpacity';
import Text from './Text';

type Props<T> = {
  options: Array<T>;
  selectedOption: T;
  onOptionSelected: (option: T | string | null) => void;
  optionExtractor?: (option: T) => string;
  placeholder?: string;
  disabled?: boolean;
  renderCustomList?: (item: T) => ReactNode;
};

const defaultOptionExtractor = (item: unknown) => String(item);

export default function Dropdown<T>(props: Props<T>) {
  let {
    options,
    selectedOption,
    onOptionSelected,
    optionExtractor = defaultOptionExtractor,
    placeholder,
    disabled,
    renderCustomList,
  } = props;

  let [inputItems, setInputItems] = useState<Array<T>>(options);
  let [inputValue, setInputValue] = useState(
    optionExtractor(selectedOption) || '',
  );

  let { isDesktop } = useViewport();

  let {
    isOpen,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    getInputProps,
    getComboboxProps,
    openMenu,
  } = useCombobox({
    items: inputItems,
    itemToString: optionExtractor,
    onInputValueChange: ({ inputValue }) => {
      if (inputValue) {
        setInputItems(
          options.filter((item) =>
            optionExtractor(item)
              .toLowerCase()
              .includes(inputValue.toLowerCase()),
          ),
        );
      } else {
        setInputItems(options);
      }
      let foundObj = options.find(
        (item) => optionExtractor(item) === inputValue,
      );
      onOptionSelected(foundObj || inputValue || null);
    },
  });

  useEffect(() => {
    setInputValue(optionExtractor(selectedOption));
  }, [selectedOption, optionExtractor]);

  return (
    <TouchableOpacity
      flex
      {...getComboboxProps()}
      onPress={openMenu}
      disabled={disabled}
      style={{ zIndex: 9999 }}
    >
      <InputContainer
        {...getInputProps({
          onChange: (e) => {
            setInputValue(e.currentTarget.value);
          },
          value: inputValue,
          onKeyDown: (e) => {
            if (
              e.keyCode === 8 &&
              selectedOption != null &&
              typeof selectedOption === 'object' &&
              ((selectedOption as unknown) as object).hasOwnProperty('id')
            ) {
              onOptionSelected(null);
            }
          },
        })}
        placeholder={placeholder}
        hasSelection={!!selectedOption}
        {...(selectedOption && {
          style: {
            caretColor: 'transparent',
            backgroundColor: disabled ? DISABLED_PILL_COLOR : THEME_COLOR,
            minWidth: 40,
            maxWidth: 200,
            color: WHITE,
            textAlign: 'center',
            height: 28,
            margin: 4,
          },
        })}
        containerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: BACKGROUND_COLOR,
        }}
      />
      <ListContainer {...getMenuProps()} isDesktop={isDesktop}>
        {isOpen
          ? inputItems.map((item, index) => (
              <OptionList
                key={index}
                {...getItemProps({
                  key: index,
                  index,
                  item,
                  style: {
                    backgroundColor:
                      highlightedIndex === index ? HIGHLIGHTED_DROPDOWN : WHITE,
                  },
                })}
                isDesktop={isDesktop}
              >
                {renderCustomList ? (
                  renderCustomList(item)
                ) : (
                  <Text>{optionExtractor(item)}</Text>
                )}
              </OptionList>
            ))
          : null}
      </ListContainer>
    </TouchableOpacity>
  );
}

type InputContainerProps = ComponentProps<'input'> & {
  hasSelection: boolean;
};

const ListContainer = styled.ul`
  padding: 0;
  position: absolute;
  margin-top: 40px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  max-height: 300px;
  overflow-y: scroll;
  ${(props: WithViewport) =>
    !props.isDesktop &&
    css`
      width: 100%;
    `};
`;
const OptionList = styled.li`
  height: 36px;
  display: flex;
  list-style: none;
  align-items: center;
  font-family: 'Avenir';
  font-size: ${FONT_SIZE_NORMAL};
  width: ${(props: WithViewport) => (props.isDesktop ? '500px' : '100%')};
`;
const InputContainer = styled(TextInput)<InputContainerProps>`
  border: none;
  background-color: ${BACKGROUND_COLOR};
  ${(props) =>
    props.hasSelection &&
    css`
      caret-color: transparent;
      background-color: ${THEME_COLOR};
      color: ${WHITE};
      text-align: center;
      height: 28px;
    `}
  &::placeholder {
    text-align: center;
    font-weight: ${FONT_WEIGHT_MEDIUM};
    color: ${GRAY_TEXT};
  }
`;
