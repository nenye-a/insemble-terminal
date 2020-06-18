import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Text } from '../../core-ui';
import { GRAY_TEXT } from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { TableType } from '../../generated/globalTypes';

import AddFeedbackModal from './AddFeedbackModal';

type Props = {
  tableId?: string;
  tableType: TableType;
};

export default function FeedbackButton(props: Props) {
  let { tableId, tableType } = props;
  let [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <FeedbackBtn
        mode="transparent"
        onPress={() => {
          setModalVisible(true);
        }}
        text="Feedback"
      />
      <AddFeedbackModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        tableId={tableId}
        tableType={tableType}
      />
    </>
  );
}

const FeedbackBtn = styled(Button)`
  align-self: flex-end;
  ${Text} {
    font-style: italic;
    color: ${GRAY_TEXT};
    font-weight: ${FONT_WEIGHT_MEDIUM};
  }
`;
