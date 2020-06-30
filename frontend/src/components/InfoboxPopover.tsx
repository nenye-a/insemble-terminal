import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { View, Modal, TouchableOpacity } from '../core-ui';
import { DISABLED_TEXT_COLOR, THEME_COLOR } from '../constants/colors';
import { DEFAULT_BORDER_RADIUS } from '../constants/theme';

import SvgQuestionMark from './icons/question-mark';

type Props = {
  isOpen: boolean;
  content: () => JSX.Element;
  onChange: (isOpen: boolean) => void;
  disabled?: boolean;
  isDesktop: boolean;
};

export default function InfoboxPopover(props: Props) {
  let { isOpen, content, onChange, disabled, isDesktop } = props;
  let [modalVisible, setModalVisible] = useState(false);

  let icon = (
    <SvgQuestionMark
      style={{ color: disabled ? DISABLED_TEXT_COLOR : THEME_COLOR }}
    />
  );

  if (!isDesktop) {
    return (
      <>
        <Touchable
          onPress={() => {
            setModalVisible(true);
          }}
        >
          {icon}
        </Touchable>
        <ModalContainer
          visible={modalVisible}
          hideCloseButton
          onClose={() => {
            setModalVisible(false);
          }}
        >
          {content()}
        </ModalContainer>
      </>
    );
  }
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
          {icon}
        </View>
      )}
    </Popover>
  );
}

const Touchable = styled(TouchableOpacity)`
  margin-left: 12px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;

const ModalContainer = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;
