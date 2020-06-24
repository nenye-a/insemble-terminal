import React from 'react';
import styled from 'styled-components';

import { View, Pill } from '../core-ui';
import { WHITE, SHADOW_COLOR } from '../constants/colors';
import { DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { useViewport } from '../helpers';

type Props<T> = ViewProps & {
  options: Array<T>;
  optionExtractor?: (option: T) => string;
  selectedOptions: Array<T>;
  onSelect?: (selectedOption: T) => void;
  onUnselect?: (selectedOption: T) => void;
};

const defaultOptionExtractor = (item: unknown) => String(item);

export default function PillSelector<T>(props: Props<T>) {
  let {
    options,
    selectedOptions,
    optionExtractor = defaultOptionExtractor,
    style,
    onSelect,
    onUnselect,
  } = props;
  let { isDesktop } = useViewport();
  return (
    <Container style={style} isDesktop={isDesktop}>
      {options.map((option: T, index: number) => {
        let label = optionExtractor(option);
        let isSelected = selectedOptions.includes(option);
        return (
          <SelectionPill
            key={index}
            onPress={() => {
              if (isSelected) {
                onUnselect && onUnselect(option);
              } else {
                onSelect && onSelect(option);
              }
            }}
            style={{ margin: 4 }}
          >
            {label}
          </SelectionPill>
        );
      })}
    </Container>
  );
}

const Container = styled(View)<ViewProps & WithViewport>`
  background-color: ${WHITE};
  padding: 8px;
  box-shadow: ${SHADOW_COLOR};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  flex-flow: row wrap;
  width: ${(props) => (props.isDesktop ? '454px' : '85vw')};
`;

const SelectionPill = styled(Pill)`
  margin: 8px;
`;
