import React from 'react';
import styled from 'styled-components';

import { ClickAway, View, Pill } from '../core-ui';
import { WHITE, SHADOW_COLOR } from '../constants/colors';

type Props<T> = ViewProps & {
  options: Array<T>;
  optionExtractor?: (option: T) => string;
  selectedOptions: Array<T>;
  onSelect?: (selectedOption: T) => void;
  onUnselect?: (selectedOption: T) => void;
  onClickAway: () => void;
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
    onClickAway,
  } = props;
  return (
    <ClickAway onClickAway={onClickAway}>
      <Container style={style}>
        <SelectionWrapper>
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
        </SelectionWrapper>
      </Container>
    </ClickAway>
  );
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 8px;
  box-shadow: ${SHADOW_COLOR};
`;
const SelectionWrapper = styled(View)`
  flex-flow: row wrap;
  width: 454px;
`;

const SelectionPill = styled(Pill)`
  margin: 8px;
`;
