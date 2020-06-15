import React from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useForm, FieldValues } from 'react-hook-form';

import { View, TextInput, Button, Text, Form, Alert } from '../../core-ui';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';
import {
  CreateTerminal,
  CreateTerminalVariables,
} from '../../generated/CreateTerminal';
import {
  CREATE_TERMINAL,
  GET_TERMINAL_LIST,
} from '../../graphql/queries/server/terminals';

type Props = { onClose: () => void };

export default function AddNewTerminalForm(props: Props) {
  let { onClose } = props;
  let [
    addTerminal,
    { loading: addTerminalLoading, error: addTerminalError },
  ] = useMutation<CreateTerminal, CreateTerminalVariables>(CREATE_TERMINAL, {
    onCompleted: () => {
      onClose();
    },
  });
  let { register, handleSubmit, errors } = useForm();
  let containerStyle = { paddingTop: 6, paddingBottom: 6 };

  let onSubmit = (data: FieldValues) => {
    let { name, description } = data;
    addTerminal({
      variables: {
        name,
        description,
      },
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_TERMINAL_LIST }],
    });
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Alert
        visible={!!addTerminalError}
        text={addTerminalError?.message || ''}
      />
      <Title>Add a New Terminal</Title>
      <TextInput
        label="Name"
        containerStyle={containerStyle}
        ref={register({
          required: 'Name should not be empty',
        })}
        name="name"
        {...(errors?.name?.message && {
          errorMessage: errors.name.message,
        })}
      />
      <TextInput
        label="Description (optional)"
        containerStyle={containerStyle}
        ref={register()}
        name="description"
      />
      <ButtonContainer>
        <Button text="Cancel" size="small" mode="secondary" onPress={onClose} />
        <Button
          type="submit"
          text="Create"
          size="small"
          style={{ marginLeft: 8 }}
          loading={addTerminalLoading}
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
