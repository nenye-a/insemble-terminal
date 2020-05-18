import React from 'react';

import { THEME_COLOR } from '../constants/colors';
import { FONT_SIZE_XSMALL } from '../constants/theme';

import Text from './Text';

export type LabelProps = TextProps & {
  text: string;
  id?: string;
  color?: string;
};

export default function Label(props: LabelProps) {
  let { text, id, color, ...otherProps } = props;
  return (
    <Text
      fontSize={FONT_SIZE_XSMALL}
      color={color ? color : THEME_COLOR}
      htmlFor={id}
      as={id ? 'label' : 'h5'}
      {...otherProps}
    >
      {text}
    </Text>
  );
}
