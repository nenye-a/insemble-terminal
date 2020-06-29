import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';
import { useForm, FieldValues } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { View, TextInput, Button, TextArea, Form, Text } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import SvgRoundAdd from '../../components/icons/round-add';
import ResultTitle from '../results/ResultTitle';
import { CREATE_TERMINAL_NOTE } from '../../graphql/queries/server/notes';
import {
  CreateTerminalNote,
  CreateTerminalNoteVariables,
} from '../../generated/CreateTerminalNote';
import { GET_TERMINAL } from '../../graphql/queries/server/terminals';

type Params = {
  terminalId: string;
};
export default function AddNoteButton() {
  let [isEditing, setIsEditing] = useState(false);
  let params = useParams<Params>();
  let alert = useAlert();

  let { register, handleSubmit, errors, reset } = useForm();
  let [createNote, { loading }] = useMutation<
    CreateTerminalNote,
    CreateTerminalNoteVariables
  >(CREATE_TERMINAL_NOTE, {
    onError: (e) => {
      alert.show(e.message);
    },
    onCompleted: () => {
      reset();
      alert.show('Note successfully created');
    },
  });

  let onSubmit = (fieldValues: FieldValues) => {
    let { title = '', content = '' } = fieldValues;
    if (Object.keys(errors).length === 0) {
      createNote({
        variables: {
          terminalId: params.terminalId,
          title,
          content,
        },
        refetchQueries: [
          {
            query: GET_TERMINAL,
            variables: {
              terminalId: params.terminalId,
            },
          },
        ],
        awaitRefetchQueries: true,
      });
    }
  };

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
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <TextInput
              placeholder="Title"
              containerStyle={{ width: '50%' }}
              name="title"
              ref={register({
                required: 'Title should not be empty',
              })}
              {...(errors?.title?.message && {
                errorMessage: errors.title.message,
              })}
            />
            <Button
              mode="transparent"
              text="Save"
              type="submit"
              loading={loading}
            />
          </Row>
          <TextArea
            placeholder="Notes"
            name="content"
            ref={register({
              required: 'Note should not be empty',
            })}
            {...(errors?.content?.message && {
              errorMessage: errors.content.message,
            })}
          />
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
