import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { Redirect } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';

import { TextInput, Button, View, Form, Alert } from '../../core-ui';
import { validateEmail } from '../../helpers';
import { UserLogin, UserLoginVariables } from '../../generated/UserLogin';
import { USER_LOGIN } from '../../graphql/queries/server/auth';
import { useAuth } from '../../context';

export default function Login() {
  let { register, handleSubmit, errors } = useForm();
  let { login: saveToken } = useAuth();
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };
  let [login, { data, loading, error }] = useMutation<
    UserLogin,
    UserLoginVariables
  >(USER_LOGIN);

  let onSubmit = (data: FieldValues) => {
    let { email, password } = data;
    login({
      variables: { email, password },
    });
  };

  if (data?.login.token) {
    let { token } = data.login;
    saveToken(token);
    return <Redirect to="/results" />;
  }

  return (
    <Content>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Alert visible={!!error} text={error?.message || ''} />
        <TextInput
          name="email"
          ref={register({
            required: 'Email should not be empty',
            validate: (val) => validateEmail(val) || 'Incorrect email format',
          })}
          label="Email Address"
          placeholder="Your Email Address"
          {...(errors?.email?.message && {
            errorMessage: errors.email.message,
          })}
          containerStyle={inputContainerStyle}
        />
        <TextInput
          name="password"
          ref={register({
            required: 'Password should not be empty',
          })}
          label="Password"
          placeholder="Enter Password"
          type="password"
          {...(errors?.password?.message && {
            errorMessage: errors.password.message,
          })}
          containerStyle={inputContainerStyle}
        />
        <SubmitButton text="Submit" type="submit" loading={loading} />
      </Form>
    </Content>
  );
}

const Content = styled(View)`
  width: 100%;
`;
const SubmitButton = styled(Button)`
  margin: 15px 0 10px 0;
  width: 100%;
`;
