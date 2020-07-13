import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { View, Text, Link, Card } from '../../core-ui';
import { Background } from '../../components';
import { WHITE, PURPLE_LINK } from '../../constants/colors';

import SignUpForm from './SignUpForm';

export default function SignUpScene() {
  let { referralCode } = useParams();
  return (
    <Background mode="halfPurple">
      <Container>
        <Card title="Sign Up">
          <FormContainer>
            <SignUpForm referralCode={referralCode} />
          </FormContainer>
        </Card>
        <RowView style={{ marginTop: 16 }}>
          <Text color={WHITE}>Already have an account? </Text>
          <Link href="/login" style={{ color: PURPLE_LINK, fontWeight: 500 }}>
            Log in here
          </Link>
        </RowView>
      </Container>
    </Background>
  );
}

const FormContainer = styled(View)`
  padding: 12px 24px;
  width: 100%;
  max-width: 360px;
`;

const RowView = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
`;

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  overflow-y: scroll;
  padding: 40px 0;
`;
