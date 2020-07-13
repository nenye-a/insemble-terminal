import React, { useState, CSSProperties } from 'react';

import { View, Button } from '../core-ui';
import { FONT_WEIGHT_HEAVY, FONT_SIZE_NORMAL } from '../constants/theme';
import { THEME_COLOR } from '../constants/colors';
import TutorialModal from '../scenes/tutorial/TutorialModal';

import SvgQuestionMark from './icons/question-mark';

type Props = {
  style?: CSSProperties;
};

export default function TutorialButton(props: Props) {
  let { style } = props;
  let [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={style}>
      <TutorialModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      />
      <Button
        shape="round"
        mode="withShadow"
        text="Tutorial"
        iconPlacement="start"
        onPress={() => {
          setModalVisible(true);
        }}
        style={{ height: 39, borderRadius: 20, width: 104 }}
        textProps={{
          style: { fontWeight: FONT_WEIGHT_HEAVY, fontSize: FONT_SIZE_NORMAL },
        }}
        icon={
          <SvgQuestionMark style={{ color: THEME_COLOR, marginRight: 8 }} />
        }
      />
    </View>
  );
}
