import React, { useState, useMemo, ComponentProps } from 'react';
import { useCombobox } from 'downshift';
import styled, { css } from 'styled-components';

import {
  HIGHLIGHTED_DROPDOWN,
  WHITE,
  BACKGROUND_COLOR,
  SHADOW_COLOR,
  THEME_COLOR,
} from '../constants/colors';
import { FONT_SIZE_NORMAL, DEFAULT_BORDER_RADIUS } from '../constants/theme';

import TextInput from './TextInput';
import TouchableOpacity from './TouchableOpacity';

type Props<T> = {
  options: Array<T>;
  selectedOption: T;
  onOptionSelected: (option: T | null) => void;
  optionExtractor?: (option: T) => string;
  placeholder?: string;
};

const defaultOptionExtractor = (item: unknown) => String(item);

export default function Dropdown<T>(props: Props<T>) {
  let {
    options,
    selectedOption,
    onOptionSelected,
    optionExtractor = defaultOptionExtractor,
    placeholder,
  } = props;

  let [inputItems, setInputItems] = useState<Array<T>>(options);
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
      if (foundObj) {
        onOptionSelected(foundObj);
      }
    },
  });

  let hasSelection = useMemo(() => {
    return !!options.find(
      (item) => optionExtractor(item) === optionExtractor(selectedOption),
    );
  }, [selectedOption, options, optionExtractor]);
  return (
    <TouchableOpacity {...getComboboxProps()} onPress={openMenu}>
      <InputContainer
        {...getInputProps()}
        placeholder={placeholder}
        hasSelection={hasSelection}
        {...(selectedOption &&
          hasSelection && {
            style: {
              caretColor: 'transparent',
              backgroundColor: THEME_COLOR,
              color: WHITE,
              textAlign: 'center',
              height: 28,
            },
          })}
        onKeyUp={(event) => {
          // pressing delete on keyboard
          if (event.which === 8) {
            onOptionSelected(null);
          }
        }}
      />
      <ListContainer {...getMenuProps()}>
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
              >
                {optionExtractor(item)}
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
  overflow: hidden;
`;
const OptionList = styled.li`
  height: 36px;
  display: flex;
  list-style: none;
  align-items: center;
  padding: 8px 18px;
  font-family: 'Avenir';
  font-size: ${FONT_SIZE_NORMAL};
  min-width: 200px;
  max-width: 300px;
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
`;
