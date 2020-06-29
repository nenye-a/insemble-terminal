import React, { useState } from 'react';
import styled from 'styled-components';

import { View, TextInput, Button, TextArea, Form, Text } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import SvgRoundAdd from '../../components/icons/round-add';
import ResultTitle from '../results/ResultTitle';

export default function AddNoteButton() {
  let [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <View>
      <ResultTitle
        title="Note"
        onClosePress={() => {
          setIsEditing(false);
        }}
        tableId=""
      />
      <NotesContainer>
        <Form onSubmit={() => {}}>
          <Row>
            <TextInput placeholder="Title" containerStyle={{ width: '50%' }} />
            <Button mode="transparent" text="Save" type="submit" />
          </Row>
          <TextArea placeholder="Notes" />
        </Form>
      </NotesContainer>
    </View>
  ) : (
    <View>
      <Button
        text="Add Note"
        mode="transparent"
        icon={<SvgRoundAdd style={{ marginRight: 8 }} />}
        iconPlacement="start"
        onPress={() => {
          setIsEditing(true);
        }}
      />
    </View>
  );
}

const NotesContainer = styled(View)`
  padding: 16px 22px;
  background-color: ${WHITE};
`;
const Row = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;
