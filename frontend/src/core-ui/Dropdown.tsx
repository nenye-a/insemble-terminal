import React, { useEffect, useRef, useState } from 'react';
import { useCombobox } from 'downshift';
import styled from 'styled-components';

import {
  HIGHLIGHTED_DROPDOWN,
  WHITE,
  BACKGROUND_COLOR,
} from '../constants/colors';
import { FONT_SIZE_NORMAL } from '../constants/theme';

import View from './View';
import TextInput from './TextInput';
import Pill from './Pill';
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
  let inputRowRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    let onKeyDown = (event: KeyboardEvent) => {
      if (event.which === 8) {
        onOptionSelected(null);
      }
    };

    let inputRow = inputRowRef.current;

    inputRow?.addEventListener('keydown', onKeyDown);
    return () => {
      inputRow?.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TouchableOpacity
      {...getComboboxProps()}
      onPress={() => {
        openMenu();
        // TODO: improve a11y
      }}
      ref={inputRowRef}
    >
      <InputRow ref={inputRowRef}>
        {selectedOption && (
          <SelectedPill>{optionExtractor(selectedOption)}</SelectedPill>
        )}
        <InputContainer
          {...getInputProps()}
          placeholder={placeholder}
          {...(!selectedOption
            ? { containerStyle: { flex: 1 } }
            : { style: { width: 0, padding: 0 } })}
        />
      </InputRow>
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
                {item}
              </OptionList>
            ))
          : null}
      </ListContainer>
    </TouchableOpacity>
  );
}

const InputRow = styled(View)`
  flex: 1;
  flex-direction: row;
  width: 200px;
  justify-content: center;
  align-items: center;
`;
const ListContainer = styled.ul`
  padding: 0;
  position: absolute;
  margin-top: 40px;
`;
const OptionList = styled.li`
  height: 36px;
  display: flex;
  list-style: none;
  align-items: center;
  padding: 8px;
  font-family: 'Avenir';
  font-size: ${FONT_SIZE_NORMAL};
  min-width: 200px;
  max-width: 300px;
`;
const InputContainer = styled(TextInput)`
  border: none;
  background-color: ${BACKGROUND_COLOR};
`;
const SelectedPill = styled(Pill)`
  max-width: 190px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
