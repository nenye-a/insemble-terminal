import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';

import {
  View,
  Card,
  Form,
  TextInput,
  Button,
  Text,
  Alert,
  Link,
} from '../../core-ui';
import { ACTIVATE_ACCOUNT } from '../../graphql/queries/server/license';
import {
  ActivateAccount,
  ActivateAccountVariables,
} from '../../generated/ActivateAccount';
import { GET_USER_PROFILE } from '../../graphql/queries/server/profile';

export default function ActivationScene() {
  let { register, handleSubmit, errors } = useForm();
  let history = useHistory();
  let [activateAccount, { loading, error }] = useMutation<
    ActivateAccount,
    ActivateAccountVariables
  >(ACTIVATE_ACCOUNT, {
    onCompleted: () => {
      history.push('/');
    },
  });
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (fieldValues: FieldValues) => {
    if (Object.keys(errors).length === 0) {
      let { activationToken } = fieldValues;
      let activationVariables = { activationToken };
      activateAccount({
        variables: activationVariables,
        awaitRefetchQueries: true,
        refetchQueries: [{ query: GET_USER_PROFILE }],
      });
    }
  };

  return (
    <Container>
      <CardContainer title="Activate Account">
        <Content onSubmit={handleSubmit(onSubmit)}>
          <Alert visible={!!error?.message} text={error?.message || ''} />
          <Text>
            Please activate your account. If you do not have a token, contact{' '}
            {
              <Link target="_top" href="/contact-us">
                sales@insemblegroup.com
              </Link>
            }
            .
          </Text>
          <TextInput
            name="activationToken"
            ref={register({
              required: 'Please enter you access token.',
            })}
            label="Access Token"
            placeholder="Enter Access Token"
            {...(errors?.activationToken?.message && {
              errorMessage: errors.activationToken.message,
            })}
            containerStyle={inputContainerStyle}
          />
          <SubmitButton text="Submit" type="submit" loading={loading} />
        </Content>
      </CardContainer>
    </Container>
  );
}

const Container = styled(View)`
  padding: 40px;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
`;

const CardContainer = styled(Card)`
  width: 360px;
  min-height: 200px;
`;

const Content = styled(Form)`
  padding: 12px 24px;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;
