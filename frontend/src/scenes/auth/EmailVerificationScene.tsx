import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useParams, Redirect } from 'react-router-dom';

import { View, Text, Card } from '../../core-ui';
import InsembleLogo from '../../components/InsembleLogo';
import { FONT_SIZE_MEDIUM, FONT_WEIGHT_LIGHT } from '../../constants/theme';
import { DARK_TEXT_COLOR } from '../../constants/colors';
import { USER_REGISTER_VERIFICATION } from '../../graphql/queries/server/auth';
import {
  UserRegisterVerification,
  UserRegisterVerificationVariables,
} from '../../generated/UserRegisterVerification';
import { useAuth } from '../../context';

export default function EmailVerificationScene() {
  let { login } = useAuth();
  let { verificationId } = useParams();
  let { data } = useQuery<
    UserRegisterVerification,
    UserRegisterVerificationVariables
  >(USER_REGISTER_VERIFICATION, {
    // Will keep polling every 3 seconds until it receive a confirmation that email has already verified
    pollInterval: 3000,
    variables: {
      verificationId: verificationId || '',
    },
  });

  if (data) {
    let {
      userRegisterVerification: { verified, auth },
    } = data;
    if (verified && auth) {
      let { token } = auth;
      // Saving token to local storage
      login(token);

      return <Redirect to="/" />;
    }
  }
  return (
    <Container flex title="Verify your email">
      <ContentContainer flex={true}>
        <InsembleLogo color="purple" />
        <Description>
          We have sent an email with a verification link to you. Please follow
          the instructions to complete your registration. If you do not see the email,
          please check your spam or promotions folders.
        </Description>
      </ContentContainer>
    </Container>
  );
}

const Container = styled(Card)`
  align-self: center;
  margin: 24px;
  width: 720px;
  min-height: 80vh;
`;
const ContentContainer = styled(View)`
  flex: 0;
  align-items: flex-start;
  padding: 48px;
`;

const Description = styled(Text)`
  font-size: ${FONT_SIZE_MEDIUM};
  font-weight: ${FONT_WEIGHT_LIGHT};
  margin: 16px 0 0 0;
  color: ${DARK_TEXT_COLOR};
`;
