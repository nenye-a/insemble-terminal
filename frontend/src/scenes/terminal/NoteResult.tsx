import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, Text, Button, LoadingIndicator } from '../../core-ui';
import { ErrorComponent } from '../../components';
import { formatErrorMessage } from '../../helpers';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR, WHITE } from '../../constants/colors';
import { GET_NOTE_DATA } from '../../graphql/queries/server/notes';
import { GetNote, GetNoteVariables } from '../../generated/GetNote';
import ResultTitle from '../results/ResultTitle';

import ManageNoteForm from './ManageNoteForm';

type Props = {
  readOnly?: boolean;
  tableId?: string;
  pinTableId?: string;
};

export default function NoteResult(props: Props) {
  let { readOnly, tableId, pinTableId } = props;
  let [isEditing, setIsEditing] = useState(false);
  let { data, loading, error } = useQuery<GetNote, GetNoteVariables>(
    GET_NOTE_DATA,
    {
      variables: {
        noteId: tableId || '',
      },
    },
  );

  return (
    <Container>
      <ResultTitle
        title="Note"
        tableId={tableId || ''}
        readOnly={readOnly}
        pinTableId={pinTableId}
      />
      {loading ? (
        <LoadingIndicator
          containerStyle={{ minHeight: 90, backgroundColor: WHITE }}
        />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : data ? (
        !isEditing ? (
          <NotesContainer>
            <Row>
              <Title>{data.note.title}</Title>
              <Button
                mode="transparent"
                text="Edit"
                onPress={() => {
                  setIsEditing(true);
                }}
              />
            </Row>
            <Text>{data.note.content}</Text>
          </NotesContainer>
        ) : (
          <NotesContainer>
            <ManageNoteForm
              mode="edit"
              tableId={tableId}
              defaultTitle={data.note.title}
              defaultContent={data.note.content}
            />
          </NotesContainer>
        )
      ) : null}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;

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
