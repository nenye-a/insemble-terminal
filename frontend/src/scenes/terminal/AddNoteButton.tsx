import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { View, Button } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import SvgRoundAdd from '../../components/icons/round-add';
import ResultTitle from '../results/ResultTitle';

import ManageNoteForm from './ManageNoteForm';

type Params = {
  terminalId: string;
};
export default function AddNoteButton() {
  let [isEditing, setIsEditing] = useState(false);
  let params = useParams<Params>();

  return isEditing ? (
    <View>
      <ResultTitle
        title="Note"
        onClosePress={() => {
          setIsEditing(false);
        }}
        canCompare={false}
      />
      <NotesContainer>
        <ManageNoteForm mode="add" terminalId={params.terminalId} />
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
