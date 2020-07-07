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
  width: 400px;
`;

const FormContainer = styled(View)`
  padding: 24px;
`;

// TODO: change color to variable. currently if we put variable, the color is not passed
const PurpleLink = styled(Link)`
  color: #c9cbff;
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
