import React from 'react';
import styled from 'styled-components';

import { Modal, View, Text, TextInput, Button } from '../../core-ui';
import {
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
  DEFAULT_BORDER_RADIUS,
} from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddNewTerminalModal(props: Props) {
  let { visible, onClose } = props;
  let containerStyle = { paddingTop: 6, paddingBottom: 6 };
  return (
    <Container visible={visible} hideCloseButton={true} onClose={onClose}>
      <Title>Add a New Terminal</Title>
      <TextInput label="Name" containerStyle={containerStyle} />
      <TextInput
        label="Description (optional)"
        containerStyle={containerStyle}
      />
      <ButtonContainer>
        <Button text="Cancel" size="small" mode="secondary" onPress={onClose} />
        <Button
          text="Create"
          size="small"
          style={{ marginLeft: 8 }}
          onPress={() => {
            // TODO: connect BE
          }}
        />
      </ButtonContainer>
    </Container>
  );
}

const Container = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  padding: 20px 24px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 0;
`;

const Title = styled(Text)`
  font-size: ${FONT_SIZE_LARGE};
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  padding: 6px 0;
`;
