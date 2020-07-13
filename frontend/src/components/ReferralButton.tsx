import React, { useState, CSSProperties } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { TouchableOpacity, Text, View, Link } from '../core-ui';
import {
  THEME_COLOR,
  WHITE,
  DEPTH_SHADOW_COLOR,
  PURPLE_LINK,
} from '../constants/colors';
import { FONT_WEIGHT_BOLD, FONT_WEIGHT_HEAVY } from '../constants/theme';

import SvgArrowRight from './icons/arrow-right';

type Props = {
  style?: CSSProperties;
};

export default function ReferralButton(props: Props) {
  let { style } = props;
  let [popoverVisible, setPopoverVisible] = useState(false);

  let popoverContent = (
    <PopoverContainer>
      <Text fontWeight={FONT_WEIGHT_BOLD} style={{ textAlign: 'center' }}>
        Refer an Insemble Terminal Subscriber and you both get two months free.
      </Text>
      <ReferLink href="/referral">
        Refer a colleague
        <SvgArrowRight
          style={{ marginLeft: 8 }}
          pathStyle={{ strokeWidth: 1, stroke: THEME_COLOR }}
        />
      </ReferLink>
    </PopoverContainer>
  );
  return (
    <Popover
      isOpen={popoverVisible}
      content={popoverContent}
      position={['bottom']}
      align="end"
      onClickOutside={() => setPopoverVisible(false)}
    >
      {(ref) => (
        <Touchable
          ref={ref}
          style={style}
          onPress={() => setPopoverVisible(true)}
        >
          <Text color={WHITE} fontWeight={FONT_WEIGHT_BOLD}>
            Save{' '}
            <Text color={PURPLE_LINK} fontWeight={FONT_WEIGHT_HEAVY}>
              $1000
            </Text>{' '}
            today
          </Text>
        </Touchable>
      )}
    </Popover>
  );
}

const Touchable = styled(TouchableOpacity)`
  background-color: ${THEME_COLOR};
  padding: 10px 35px;
  border-radius: 20px;
  width: 190px;
  box-shadow: ${DEPTH_SHADOW_COLOR};
  z-index: 1;
`;

const PopoverContainer = styled(View)`
  width: 190px;
  background-color: ${WHITE};
  box-shadow: ${DEPTH_SHADOW_COLOR};
  padding: 24px 12px;
  border-radius: 24px;
`;

const ReferLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_HEAVY};
  margin-top: 35px;
`;
