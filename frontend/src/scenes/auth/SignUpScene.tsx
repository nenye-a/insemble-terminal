import React from 'react';
import styled from 'styled-components';

import { View, Text, Button, Card } from '../../core-ui';

import SignUpForm from './SignUpForm';

export default function SignUpScene() {
  return (
    <Container>
      <Card title="Sign Up">
        <FormContainer>
          <SignUpForm />
        </FormContainer>
      </Card>
      <RowView style={{ marginTop: 16 }}>
        <Text>Already have an account? </Text>
        <Button
          mode="transparent"
          text="Log in here"
          onPress={() => {
            // TODO: navigate
          }}
        />
      </RowView>
    </Container>
  );
}

const FormContainer = styled(View)`
  padding: 12px 24px;
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
