import React from 'react';
import styled from 'styled-components';

import { Text, View, TouchableOpacity } from '../core-ui';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';
import { THEME_COLOR } from '../constants/colors';

type TabProps<T> = {
  activeTabIndex: number;
  options: Array<T>;
  onTabPress: (tabIndex: number) => void;
  optionExtractor?: (item: T) => string;
};

const defaultOptionExtractor = (item: unknown) => String(item);

export default function Tab<T>(props: TabProps<T>) {
  let {
    activeTabIndex,
    options,
    onTabPress,
    optionExtractor = defaultOptionExtractor,
  } = props;
  return (
    <Row>
      {options.map((item, idx) => {
        let option = optionExtractor(item);
        let isSelected = activeTabIndex === idx;
        return (
          <OptionContainer
            key={idx}
            onPress={() => {
              onTabPress(idx);
            }}
          >
            <Text
              fontWeight={FONT_WEIGHT_MEDIUM}
              {...(isSelected && { style: { color: THEME_COLOR } })}
            >
              {option}
            </Text>
          </OptionContainer>
        );
      })}
    </Row>
  );
}

const Row = styled(View)`
  flex-direction: row;
`;
const OptionContainer = styled(TouchableOpacity)`
  padding: 24px;
`;
