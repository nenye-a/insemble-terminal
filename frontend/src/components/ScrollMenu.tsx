import React, { useState, useEffect, CSSProperties } from 'react';
import styled from 'styled-components';

import { View, Text, TouchableOpacity } from '../core-ui';
import { THEME_COLOR, MUTED_TEXT_COLOR, GRAY } from '../constants/colors';
import {
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_NORMAL,
  FONT_SIZE_XSMALL,
} from '../constants/theme';

import SvgArrowLeft from './icons/arrow-left';
import SvgArrowRight from './icons/arrow-right';

type Props<T> = {
  selectedOption: T;
  options: Array<T>;
  onSelectionChange: (selectedOptionIndex: number) => void;
  optionExtractor?: (option: T) => string;
  containerStyle?: CSSProperties;
};

type OptionsContainerProps = {
  width: number;
};

let defaultOptionExtractor = (item: unknown) => String(item);

export default function ScrollMenu<T>(props: Props<T>) {
  let {
    selectedOption,
    options,
    onSelectionChange,
    optionExtractor = defaultOptionExtractor,
    containerStyle,
  } = props;
  let [allOptionsWidth, setSegmentsWidth] = useState<Array<number>>([]);
  let selectedOptionIndex = selectedOption
    ? options.indexOf(selectedOption)
    : 0;

  useEffect(() => {
    let allWidth = options.map((_, index) => {
      let target = document.getElementById('option-' + index);
      if (target) {
        return target.getBoundingClientRect().width;
      }
      return 0;
    });
    // populating width of each options
    setSegmentsWidth(allWidth);
  }, [options]);

  let translatedWidth = allOptionsWidth
    .slice(0, selectedOptionIndex)
    .reduce((a, b) => a + b, 0);

  return (
    <Container style={containerStyle}>
      <TouchableOpacity
        disabled={selectedOptionIndex !== 0}
        onPress={() => onSelectionChange(selectedOptionIndex - 1)}
      >
        <SvgArrowLeft
          width={12}
          height={12}
          style={{
            color: selectedOptionIndex !== 0 ? THEME_COLOR : GRAY,
            marginRight: 8,
          }}
        />
      </TouchableOpacity>
      <View flex style={{ overflow: 'hidden' }}>
        <OptionsContainer width={translatedWidth}>
          {options.map((item, index) => {
            let isSelected = selectedOptionIndex === index;
            // TODO: add shadow
            return (
              <TouchableOption
                key={'option-' + index}
                onPress={() => {
                  onSelectionChange(index);
                }}
                id={'option-' + index}
              >
                <Text
                  color={isSelected ? THEME_COLOR : MUTED_TEXT_COLOR}
                  fontWeight={
                    isSelected ? FONT_WEIGHT_MEDIUM : FONT_WEIGHT_NORMAL
                  }
                  fontSize={FONT_SIZE_XSMALL}
                >
                  {optionExtractor(item)}
                </Text>
              </TouchableOption>
            );
          })}
        </OptionsContainer>
      </View>
      <TouchableOpacity
        disabled={selectedOptionIndex !== options.length - 1}
        onPress={() => onSelectionChange(selectedOptionIndex + 1)}
      >
        <SvgArrowRight
          width={12}
          height={12}
          style={{
            color:
              selectedOptionIndex !== options.length - 1 ? THEME_COLOR : GRAY,
            marginRight: 8,
          }}
        />
      </TouchableOpacity>
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const OptionsContainer = styled(View)<OptionsContainerProps>`
  flex-direction: row;
  transition: all 0.3s;
  transform: translate(-${({ width }) => width.toString() + 'px'});
  align-items: center;
`;

const TouchableOption = styled(TouchableOpacity)`
  justify-content: center;
  padding: 0 8px;
  background-color: transparent;
`;
