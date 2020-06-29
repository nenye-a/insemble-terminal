import React from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';
import { useForm, FieldValues } from 'react-hook-form';

import { View, TextInput, Button, TextArea, Form } from '../../core-ui';
import {
  CREATE_TERMINAL_NOTE,
  EDIT_NOTE,
} from '../../graphql/queries/server/notes';
import {
  CreateTerminalNote,
  CreateTerminalNoteVariables,
} from '../../generated/CreateTerminalNote';
import { GET_TERMINAL } from '../../graphql/queries/server/terminals';
import { EditNote, EditNoteVariables } from '../../generated/EditNote';

type Props = {
  mode?: 'add' | 'edit';
  terminalId?: string;
  tableId?: string;
  defaultTitle?: string;
  defaultContent?: string;
};

export default function ManageNoteForm(props: Props) {
  let {
    terminalId,
    tableId,
    mode = 'add',
    defaultTitle,
    defaultContent,
  } = props;
  let { register, handleSubmit, errors, reset } = useForm();
  let alert = useAlert();

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

  let [editNote, { loading: editNoteLoading }] = useMutation<
    EditNote,
    EditNoteVariables
  >(EDIT_NOTE);

  let onSubmit = (fieldValues: FieldValues) => {
    let { title = '', content = '' } = fieldValues;
    if (Object.keys(errors).length === 0) {
      if (mode === 'add' && terminalId) {
        createNote({
          variables: {
            terminalId,
            title,
            content,
          },
          refetchQueries: [
            {
              query: GET_TERMINAL,
              variables: {
                terminalId,
              },
            },
          ],
          awaitRefetchQueries: true,
        });
      } else if (mode === 'edit' && tableId) {
        editNote({
          variables: {
            noteId: tableId,
            title,
            content,
          },
          refetchQueries: [
            {
              query: GET_TERMINAL,
              variables: {
                terminalId,
              },
            },
          ],
          awaitRefetchQueries: true,
        });
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <TextInput
          placeholder="Title"
          containerStyle={{ width: '50%' }}
          name="title"
          defaultValue={defaultTitle}
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
          loading={loading || editNoteLoading}
        />
      </Row>
      <TextArea
        placeholder="Notes"
        name="content"
        defaultValue={defaultContent}
        ref={register({
          required: 'Note should not be empty',
        })}
        {...(errors?.content?.message && {
          errorMessage: errors.content.message,
        })}
      />
    </Form>
  );
}

const Row = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;
