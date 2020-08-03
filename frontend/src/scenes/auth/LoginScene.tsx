import React from 'react';
import styled from 'styled-components';

import { Card, Text, View, Link } from '../../core-ui';
import { Background } from '../../components';
import { NAVBAR_HEIGHT, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { WHITE } from '../../constants/colors';

import LoginForm from './LoginForm';

export default function LoginScene() {
  let noAccount = "Don't have an account?";

  return (
    <Background mode="halfPurple">
      <Container flex>
        <LoginCard title="Log In">
          <FormContainer>
            <LoginForm />
          </FormContainer>
        </LoginCard>
        <NoAccountContainer>
          <Text color={WHITE}>{noAccount} </Text>
          <PurpleLink href="/signup">Sign up</PurpleLink>
          <Text color={WHITE}> or </Text>
          <PurpleLink href="/contact-us">Contact us</PurpleLink>
        </NoAccountContainer>
        <Text color={WHITE} style={{ marginTop: 8 }}>
          Forgot your password?{' '}
          <PurpleLink href="/forgot-password">Click here</PurpleLink>
        </Text>
        {/* TODO: Forgot password scene */}
      </Container>
    </Background>
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
  max-width: 400px;
  width: 100%;
`;

const FormContainer = styled(View)`
  padding: 24px;
`;

const PurpleLink = styled(Link)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
