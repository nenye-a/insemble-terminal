import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';

import { View, Card, Form, TextInput, TextArea, Button } from '../../core-ui';
import { useAuth } from '../../context';
import { validateEmail } from '../../helpers';

export default function ContactUsScene() {
  let { register, handleSubmit, errors } = useForm();
  let { isAuthenticated } = useAuth();
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (fieldValues: FieldValues) => {};

  return (
    <Container>
      <CardContainer title="Contact Us">
        <Content onSubmit={handleSubmit(onSubmit)}>
          {!isAuthenticated && (
            <>
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
              <RowedView>
                <View flex style={{ marginRight: 10 }}>
                  <TextInput
                    name="firstName"
                    ref={register({
                      required: 'First name should not be empty',
                    })}
                    label="First Name"
                    placeholder="Your First Name"
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
                    label="Last Name"
                    placeholder="Your Last Name"
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
                placeholder="Your Company"
                {...(errors?.company?.message && {
                  errorMessage: errors.company.message,
                })}
                containerStyle={inputContainerStyle}
              />
            </>
          )}
          <TextArea
            label="Message"
            name="message"
            ref={register({
              required: 'Message should not be empty',
            })}
            {...(errors?.message?.message && {
              errorMessage: errors.message.message,
            })}
            containerStyle={inputContainerStyle}
          />
          <SubmitButton text="Submit" type="submit" />
        </Content>
      </CardContainer>
    </Container>
  );
}

const Container = styled(View)`
  padding: 40px;
  align-items: center;
`;

const CardContainer = styled(Card)`
  width: 360px;
  min-height: 50px;
`;

const RowedView = styled(View)`
  flex-direction: row;
`;

const Content = styled(Form)`
  padding: 12px 24px;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;
