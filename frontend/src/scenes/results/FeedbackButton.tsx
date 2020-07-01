import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Text, View } from '../../core-ui';
import { GRAY_TEXT } from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { useViewport } from '../../helpers';
import { TableType } from '../../generated/globalTypes';

import AddFeedbackModal from './AddFeedbackModal';

type Props = {
  tableId?: string;
  tableType?: TableType;
  title?: string;
};

export default function FeedbackButton(props: Props) {
  let { tableId, tableType, title } = props;
  let [modalVisible, setModalVisible] = useState(false);
  let { isDesktop } = useViewport();

  return (
    <>
      <View
        style={
          !isDesktop ? { paddingTop: 6, paddingRight: 12 } : { paddingTop: 6 }
        }
      >
        <FeedbackBtn
          mode="transparent"
          onPress={() => {
            setModalVisible(true);
          }}
          text="Feedback"
          size="small"
        />
      </View>
      <AddFeedbackModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        tableId={tableId}
        tableType={tableType}
        title={title}
      />
    </>
  );
}

const FeedbackBtn = styled(Button)`
  align-self: flex-end;
  height: 14px;
  ${Text} {
    font-style: italic;
    color: ${GRAY_TEXT};
    font-weight: ${FONT_WEIGHT_MEDIUM};
  }
`;
