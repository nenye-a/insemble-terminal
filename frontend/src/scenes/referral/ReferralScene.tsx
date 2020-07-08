import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

import { View, Card, Form, TextInput, Button } from '../../core-ui';
import { Background } from '../../components';
import { WHITE } from '../../constants/colors';
import { validateEmail } from '../../helpers';

export default function ReferralScene() {
  let { errors, register } = useForm();

  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  return (
    <Background mode="halfPurple">
      <Container flex>
        <Card title="Refer a Colleague">
          <Form>
            <FormContent>
              <TextInput
                name="email"
                ref={register({
                  required: 'Email should not be empty',
                  validate: (val) =>
                    validateEmail(val) || 'Incorrect email format',
                })}
                label="Colleague Email Address"
                placeholder="Email Address"
                {...(errors?.email?.message && {
                  errorMessage: errors.email.message,
                })}
                containerStyle={inputContainerStyle}
              />
              <RowedView>
                <View flex style={{ marginRight: 10 }}>
                  <TextInput
                    name="firstName"
                    ref={register({
                      required: 'First name should not be empty',
                    })}
                    label="Colleague's First Name"
                    placeholder="First Name"
                    {...(errors?.firstName?.message && {
                      errorMessage: errors.firstName.message,
                    })}
                    containerStyle={inputContainerStyle}
                  />
                </View>
                <View flex style={{ marginLeft: 10 }}>
                  <TextInput
                    name="lastName"
                    ref={register({
                      required: 'Last name should not be empty',
                    })}
                    label="Colleague's Last Name"
                    placeholder="Last Name"
                    {...(errors?.lastName?.message && {
                      errorMessage: errors.lastName.message,
                    })}
                    containerStyle={inputContainerStyle}
                  />
                </View>
              </RowedView>
              <TextInput
                name="company"
                ref={register({
                  required: 'Company name should not be empty',
                })}
                label="Company"
                placeholder="Colleague's Company"
                {...(errors?.company?.message && {
                  errorMessage: errors.company.message,
                })}
                containerStyle={inputContainerStyle}
              />

              <ReferButton text="Refer" type="submit" />
            </FormContent>
          </Form>
        </Card>
      </Container>
    </Background>
  );
}

const Container = styled(View)`
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const FormContent = styled(View)`
  background-color: ${WHITE};
  padding: 12px 24px;
`;

const RowedView = styled(View)`
  flex-direction: row;
`;

const ReferButton = styled(Button)`
  margin: 12px 0;
`;
