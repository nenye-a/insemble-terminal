import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text, Button, TextInput, TextArea } from '../../core-ui';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR, WHITE } from '../../constants/colors';
import ResultTitle from '../results/ResultTitle';
import SvgRoundAdd from '../../components/icons/round-add';

type Props = {
  readOnly: boolean;
};

export default function NoteResult() {
  let noData = false; // TODO: connect BE
  let [isEditing, setIsEditing] = useState(false);

  return (
    <View>
      {isEditing ? (
        <NotesContainer>
          <Row>
            <TextInput placeholder="Title" containerStyle={{ width: '50%' }} />
            <Button mode="transparent" text="Save" />
          </Row>
          <TextArea placeholder="Notes" />
        </NotesContainer>
      ) : noData ? (
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
      ) : (
        <View>
          <ResultTitle title="Note" tableId="" />
          <NotesContainer>
            <Row>
              <Title>Notes Title</Title>
              <Button mode="transparent" text="Edit" />
            </Row>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse
            </Text>
          </NotesContainer>
        </View>
      )}
    </View>
  );
}

const NotesContainer = styled(View)`
  padding: 16px 22px;
  background-color: ${WHITE};
`;
const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  padding-bottom: 8px;
`;
const Row = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;
