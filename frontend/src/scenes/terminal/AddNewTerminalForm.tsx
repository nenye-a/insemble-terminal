import React from 'react';
import styled from 'styled-components';

import { View, TextInput, Button, Text, Form } from '../../core-ui';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';

type Props = { onClose: () => void };

export default function AddNewTerminalForm(props: Props) {
  let { onClose } = props;
  let containerStyle = { paddingTop: 6, paddingBottom: 6 };

  return (
    <Form
      onSubmit={() => {
        // TODO: call be
      }}
    >
      <Title>Add a New Terminal</Title>
      <TextInput label="Name" containerStyle={containerStyle} />
      <TextInput
        label="Description (optional)"
        containerStyle={containerStyle}
      />
      <ButtonContainer>
        <Button text="Cancel" size="small" mode="secondary" onPress={onClose} />
        <Button
          type="submit"
          text="Create"
          size="small"
          style={{ marginLeft: 8 }}
        />
      </ButtonContainer>
    </Form>
  );
}

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
