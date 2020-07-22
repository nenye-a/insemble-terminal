import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';

import {
  Card,
  Text,
  View,
  Button,
  Form,
  TextInput,
  LoadingIndicator,
  Alert,
} from '../../core-ui';
import { Background } from '../../components';
import { BACKGROUND_COLOR } from '../../constants/colors';

export default function ResetPasswordScene() {
  let { register, handleSubmit, errors, watch } = useForm();
  let [passwordSubmitted, setPasswordSubmitted] = useState(false);
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (data: FieldValues) => {
    let { newPassword } = data;
  };
  let redirectLogin = () => {};
  return (
    <Background mode="halfPurple">
      <Container>
        <ContainerCard title="New Password">
          {!passwordSubmitted ? (
            <Content>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                  label="New Password"
                  placeholder="Enter Your New Password"
                  type="password"
                  name="newPassword"
                  containerStyle={inputContainerStyle}
                  ref={register({
                    required: watch('currentPassword')
                      ? 'New password should not be empty'
                      : false,
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  {...(errors?.newPassword?.message && {
                    errorMessage: errors.newPassword.message,
                  })}
                />
                <TextInput
                  label="Confirm New Password"
                  placeholder="Re-Enter Your New Password"
                  type="password"
                  containerStyle={inputContainerStyle}
                  name="confirmNewPassword"
                  ref={register({
                    required: watch('newPassword')
                      ? 'Confirm password should not be empty'
                      : false,
                    ...(watch('newPassword') && {
                      validate: (val) =>
                        val === watch('newPassword') ||
                        'Confirm password does not match',
                    }),
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  {...(errors?.confirmNewPassword?.message && {
                    errorMessage: errors.confirmNewPassword.message,
                  })}
                />
                <SubmitButton text="Reset Password" type="submit" />
              </Form>
            </Content>
          ) : (
            <>
              <Content>
                <Text>
                  You have successfully reset your password. You can now log in
                  with your new password.
                </Text>
              </Content>
              <FooterContainer>
                <Button text="Log In" onPress={redirectLogin} />
              </FooterContainer>
            </>
          )}
        </ContainerCard>
      </Container>
    </Background>
  );
}

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ContainerCard = styled(Card)`
  max-width: 400px;
  width: 90%;
  height: fit-content;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;

const Content = styled(View)`
  padding: 12px 24px;
`;

const FooterContainer = styled(View)`
  background: ${BACKGROUND_COLOR};
  align-items: flex-end;
  padding: 12px;
`;
