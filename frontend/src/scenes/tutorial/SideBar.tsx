import React from 'react';
import styled from 'styled-components';

import { View, Text, TouchableOpacity } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_LARGE,
  FONT_SIZE_XLARGE,
} from '../../constants/theme';
import { GRAY_TEXT, SHADOW_COLOR } from '../../constants/colors';
import { useTutorialContext } from '../../context';

import { MENU } from './constants';

export default function SideBar() {
  let { onPageChange } = useTutorialContext();
  return (
    <Container>
      <Title>Tutorial</Title>
      {MENU.map((item) => (
        <View key={item.subtitle}>
          <Touchable onPress={() => onPageChange(item.path)}>
            <SubTitle>{item.subtitle}</SubTitle>
          </Touchable>
          {item.options.map((option) => (
            <Touchable
              key={option.label}
              onPress={() => onPageChange(option.path)}
            >
              <Option>{option.label}</Option>
            </Touchable>
          ))}
        </View>
      ))}
    </Container>
  );
}

const Container = styled(View)`
  padding: 35px;
  box-shadow: ${SHADOW_COLOR};
`;

const Title = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_XLARGE};
`;

const SubTitle = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: 20px;
  padding-top: 30px;
`;

const Option = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_LARGE};
  color: ${GRAY_TEXT};
`;

const Touchable = styled(TouchableOpacity)`
  padding: 6px 0;
`;
