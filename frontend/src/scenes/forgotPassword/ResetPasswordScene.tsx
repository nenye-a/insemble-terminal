import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useParams, Redirect, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';

import {
  Card,
  Text,
  View,
  Button,
  Form,
  TextInput,
  LoadingIndicator,
  Link,
  Alert,
} from '../../core-ui';
import { Background } from '../../components';
import { BACKGROUND_COLOR, THEME_COLOR } from '../../constants/colors';
import {
  RESET_PASSWORD_VERIFICATION,
  RESET_PASSWORD,
} from '../../graphql/queries/server/forgotPassword';
import {
  ResetPasswordVerification,
  ResetPasswordVerificationVariables,
} from '../../generated/ResetPasswordVerification';
import {
  ResetPassword,
  ResetPasswordVariables,
} from '../../generated/ResetPassword';

type Params = {
  verificationId: string;
};

export default function ResetPasswordScene() {
  let { register, handleSubmit, errors, watch } = useForm();
  let params = useParams<Params>();
  let history = useHistory();
  let [passwordSubmitted, setPasswordSubmitted] = useState(false);
  let [resetCode, setResetCode] = useState('');
  // Verify the id from param
  let { loading: verificationLoading, error: verificationError } = useQuery<
    ResetPasswordVerification,
    ResetPasswordVerificationVariables
  >(RESET_PASSWORD_VERIFICATION, {
    variables: {
      verificationCode: params.verificationId,
    },
    onCompleted: (verificationData) => {
      // Set the verificationId to state and use it when reseting the password
      setResetCode(verificationData.resetPasswordVerification.verificationId);
    },
  });
  let [
    resetPassword,
    { loading: resetPasswordLoading, error: resetPasswordError },
  ] = useMutation<ResetPassword, ResetPasswordVariables>(RESET_PASSWORD, {
    onCompleted: () => {
      setPasswordSubmitted(true);
    },
  });

  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (data: FieldValues) => {
    let { newPassword } = data;
    resetPassword({
      variables: {
        password: newPassword,
        verificationCode: resetCode,
      },
    });
  };

  if (!params.verificationId) {
    return <Redirect to="/" />;
  }

  return (
    <Background mode="halfPurple">
      <Container>
        <ContainerCard title="Reset Password">
          {verificationLoading ? (
            <LoadingIndicator />
          ) : verificationError ? (
            <Content>
              <Text>
                Fail to verify id. Please check the url and try again or{' '}
                <Link to="/contact-us" style={{ color: THEME_COLOR }}>
                  contact us
                </Link>
                .
              </Text>
            </Content>
          ) : !passwordSubmitted ? (
            <Content>
              <Form onSubmit={handleSubmit(onSubmit)}>
                {resetPasswordError && (
                  <Alert visible text={resetPasswordError.message} />
                )}
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
                <SubmitButton
                  text="Reset Password"
                  type="submit"
                  loading={resetPasswordLoading}
                />
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
                <Button
                  text="Log In"
                  onPress={() => {
                    history.push('/login');
                  }}
                />
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
