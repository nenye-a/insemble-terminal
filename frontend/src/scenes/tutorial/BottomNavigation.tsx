import React from 'react';
import styled from 'styled-components';

import { View, TouchableOpacity, Text } from '../../core-ui';
import SvgArrowLeft from '../../components/icons/arrow-left';
import SvgArrowRight from '../../components/icons/arrow-right';
import { DARK_TEXT_COLOR, THEME_COLOR } from '../../constants/colors';
import { FONT_WEIGHT_HEAVY } from '../../constants/theme';

type ButtonProps = {
  text: string;
  onPress: () => void;
};

type Props = {
  leftButton?: ButtonProps;
  rightButton?: ButtonProps;
};

export default function BottomNavigation(props: Props) {
  let { leftButton, rightButton } = props;
  return (
    <Container>
      <View flex>
        {leftButton && (
          <Touchable onPress={leftButton.onPress}>
            <SvgArrowLeft
              height={14}
              pathStyle={{ strokeWidth: 2, stroke: DARK_TEXT_COLOR }}
              style={{ marginRight: 8, marginLeft: -8 }}
            />
            <TouchableText color={DARK_TEXT_COLOR}>
              {leftButton.text}
            </TouchableText>
          </Touchable>
        )}
      </View>
      <View flex style={{ alignItems: 'flex-end' }}>
        {rightButton && (
          <Touchable onPress={rightButton.onPress}>
            <TouchableText color={THEME_COLOR}>
              {rightButton.text}
            </TouchableText>
            <SvgArrowRight
              height={14}
              pathStyle={{ strokeWidth: 1, stroke: THEME_COLOR }}
              style={{ marginLeft: 8 }}
            />
          </Touchable>
        )}
      </View>
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: 27px 0;
`;

const TouchableText = styled(Text)`
  font-size: 20px;
  font-weight: ${FONT_WEIGHT_HEAVY};
`;

const Touchable = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;
