import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { Card, Text, View, Button } from '../../core-ui';
import { NAVBAR_HEIGHT } from '../../constants/theme';

import LoginForm from './LoginForm';

export default function LoginScene() {
  let history = useHistory();
  let noAccount = "Don't have an account?";

  return (
    <Container flex>
      <LoginCard title="Log In">
        <FormContainer>
          <LoginForm />
        </FormContainer>
      </LoginCard>
      {/* Temporarily remove sign up page until token complete */}
      {/* <NoAccountContainer>
        <Text>{noAccount} </Text>
        <Button
          mode="transparent"
          text="Sign Up here"
          onPress={() => {
            history.push('/signup');
          }}
        />
      </NoAccountContainer> */}
      {/* TODO: Forgot password scene */}
    </Container>
  );
}

const RowView = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const NoAccountContainer = styled(RowView)`
  margin: 16px 0 0 0;
`;

const Container = styled(View)`
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - ${NAVBAR_HEIGHT});
`;

const LoginCard = styled(Card)`
  width: 400px;
`;

const FormContainer = styled(View)`
  padding: 24px;
`;
