import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

import {
  Card,
  Text,
  View,
  Button,
  Form,
  TextInput,
  Alert,
  Link,
} from '../../core-ui';
import { validateEmail } from '../../helpers';
import { Background } from '../../components';
import { WHITE } from '../../constants/colors';

export default function ForgotPasswordScene() {
  let { register, handleSubmit, errors } = useForm();
  let [hasSubmitted, setHasSubmitted] = useState(false);
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (data: FieldValues) => {
    let { email } = data;
  };

  return (
    <Background mode="halfPurple">
      <Container>
        <ContainerCard title="Recover Password">
          <Content>
            {!hasSubmitted ? (
              <Form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                  name="email"
                  ref={register({
                    required: 'Email should not be empty',
                    validate: (val) =>
                      validateEmail(val) || 'Incorrect email format',
                  })}
                  label="Email Address"
                  placeholder="Your Email Address"
                  {...(errors?.email?.message && {
                    errorMessage: errors.email.message,
                  })}
                  containerStyle={inputContainerStyle}
                />
                <SubmitButton text="Send Recovery Email" type="submit" />
              </Form>
            ) : (
              <Text>
                If we found an account associated with that username, we’ve sent
                password reset instructions to the primary email address on the
                account.
              </Text>
            )}
          </Content>
        </ContainerCard>
        <RowView>
          <Text color={WHITE}>Already have an account? </Text>
          <Link href="/login">Log in here</Link>
        </RowView>
      </Container>
    </Background>
  );
}

const Content = styled(View)`
  padding: 12px 24px;
  width: 100%;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;

const RowView = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin: 16px 0 0 0;
  align-items: center;
`;

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ContainerCard = styled(Card)`
  max-width: 400px;
  width: 90%;
`;
