import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text, TouchableOpacity } from '../../core-ui';
import { ComparisonPopover, PinPopover } from '../../components';
import { THEME_COLOR } from '../../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import SvgPin from '../../components/icons/pin';
import SvgRoundAdd from '../../components/icons/round-add';

type Props = {
  title: string;
};

export default function ResultTitle(props: Props) {
  let { title } = props;
  let [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  let [pinPopoverOpen, setPinPopoverOpen] = useState(false);

  return (
    <Container>
      <Title>{title}</Title>
      <Row>
        <View>
          <Touchable onPress={() => setComparisonPopoverOpen(true)}>
            <SvgRoundAdd />
          </Touchable>
          {comparisonPopoverOpen && (
            <ComparisonPopover
              onClickAway={() => setComparisonPopoverOpen(false)}
            />
          )}
        </View>
        <View>
          <Touchable onPress={() => setPinPopoverOpen(true)}>
            <SvgPin />
          </Touchable>
          {pinPopoverOpen && (
            <PinPopover onClickAway={() => setPinPopoverOpen(false)} />
          )}
        </View>
      </Row>
    </Container>
  );
}

const Container = styled(View)`
  padding: 8px 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 99;
`;

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const Row = styled(View)`
  flex-direction: row;
`;

const Touchable = styled(TouchableOpacity)`
  margin-left: 12px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;
