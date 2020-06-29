import React from 'react';
import Popover from 'react-tiny-popover';

import { View } from '../core-ui';
import { DISABLED_TEXT_COLOR, THEME_COLOR } from '../constants/colors';

import SvgQuestionMark from './icons/question-mark';

type Props = {
  isOpen: boolean;
  content: () => JSX.Element;
  onChange: (isOpen: boolean) => void;
  disabled?: boolean;
};

export default function InfoboxPopover(props: Props) {
  let { isOpen, content, onChange, disabled } = props;
  return (
    <Popover
      isOpen={isOpen}
      content={content}
      position={['bottom']}
      onClickOutside={() => {
        onChange(false);
      }}
      align="start"
    >
      {(ref) => (
        <View
          ref={ref}
          onMouseEnter={() => {
            onChange(true);
          }}
          onMouseLeave={() => {
            onChange(false);
          }}
          style={{ marginLeft: 4, marginRight: 4 }}
        >
          <SvgQuestionMark
            style={{ color: disabled ? DISABLED_TEXT_COLOR : THEME_COLOR }}
          />
        </View>
      )}
    </Popover>
  );
}
