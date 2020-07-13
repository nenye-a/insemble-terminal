import React from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useForm, FieldValues } from 'react-hook-form';

import { View, TextInput, Button, Text, Form, Alert } from '../../core-ui';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';
import {
  CREATE_TERMINAL,
  EDIT_TERMINAL,
  GET_TERMINAL,
  GET_TERMINAL_LIST,
} from '../../graphql/queries/server/terminals';
import {
  CreateTerminal,
  CreateTerminalVariables,
} from '../../generated/CreateTerminal';
import {
  EditTerminal,
  EditTerminalVariables,
} from '../../generated/EditTerminal';

type Props = {
  onClose: () => void;
  mode: 'add' | 'edit';
  prevName?: string;
  prevDescription?: string | null;
  terminalId?: string;
  refetchCurrentPage?: () => void;
};

export default function ManageTerminalForm(props: Props) {
  let {
    onClose,
    mode,
    prevName,
    prevDescription,
    terminalId,
    refetchCurrentPage,
  } = props;
  let [
    addTerminal,
    { loading: addTerminalLoading, error: addTerminalError },
  ] = useMutation<CreateTerminal, CreateTerminalVariables>(CREATE_TERMINAL, {
    onCompleted: () => {
      onClose();
    },
  });

  let [
    editTerminal,
    { loading: editTerminalLoading, error: editTerminalError },
  ] = useMutation<EditTerminal, EditTerminalVariables>(EDIT_TERMINAL, {
    onCompleted: () => {
      onClose();
    },
  });
  let { register, handleSubmit, errors } = useForm();
  let isEditMode = mode === 'edit';
  let containerStyle = { paddingTop: 6, paddingBottom: 6 };

  let onSubmit = async (data: FieldValues) => {
    let { name, description } = data;
    if (mode === 'add') {
      await addTerminal({
        variables: {
          name,
          description,
        },
        awaitRefetchQueries: true,
        refetchQueries: [{ query: GET_TERMINAL_LIST }],
      });
      refetchCurrentPage && refetchCurrentPage();
    } else if (mode === 'edit' && terminalId) {
      await editTerminal({
        variables: {
          name,
          description,
          terminalId,
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: GET_TERMINAL,
            variables: {
              terminalId,
            },
          },
        ],
      });
      refetchCurrentPage && refetchCurrentPage();
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Alert
        visible={!!addTerminalError}
        text={addTerminalError?.message || ''}
      />
      <Alert
        visible={!!editTerminalError}
        text={editTerminalError?.message || ''}
      />
      <Title>{isEditMode ? 'Edit Terminal' : 'Add a New Terminal'}</Title>
      <TextInput
        label="Name"
        containerStyle={containerStyle}
        ref={register({
          required: 'Name should not be empty',
        })}
        name="name"
        defaultValue={prevName}
        {...(errors?.name?.message && {
          errorMessage: errors.name.message,
        })}
      />
      <TextInput
        label="Description (optional)"
        containerStyle={containerStyle}
        ref={register}
        name="description"
        defaultValue={prevDescription || undefined}
      />
      <ButtonContainer>
        <Button
          text="Cancel"
          size="small"
          mode="secondary"
          onPress={onClose}
          stopPropagation={true}
        />
        <Button
          type="submit"
          text={isEditMode ? 'Save' : 'Create'}
          size="small"
          style={{ marginLeft: 8 }}
          loading={addTerminalLoading || editTerminalLoading}
          stopPropagation={true}
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
