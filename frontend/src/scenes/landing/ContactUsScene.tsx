import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

import {
  View,
  Card,
  Form,
  TextInput,
  TextArea,
  Button,
  Text,
  Alert,
} from '../../core-ui';
import { useAuth } from '../../context';
import { validateEmail } from '../../helpers';
import { CONTACT_US } from '../../graphql/queries/server/contact';
import { ContactUs, ContactUsVariables } from '../../generated/ContactUs';

export default function ContactUsScene() {
  let { register, handleSubmit, errors } = useForm();
  let { isAuthenticated } = useAuth();
  let [contactUs, { loading, data, error }] = useMutation<
    ContactUs,
    ContactUsVariables
  >(CONTACT_US);
  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (fieldValues: FieldValues) => {
    if (Object.keys(errors).length === 0) {
      let { firstName, lastName, company, email, message } = fieldValues;
      let contactvariables = isAuthenticated
        ? {
            msg: fieldValues.message,
          }
        : {
            firstName,
            lastName,
            company,
            email,
            msg: message,
          };
      contactUs({
        variables: contactvariables,
      });
    }
  };

  return (
    <Container>
      <CardContainer title="Contact Us">
        <Content onSubmit={handleSubmit(onSubmit)}>
          {data ? (
            <Text>
              Your message has been received. We will get back to you soon.
            </Text>
          ) : (
            <>
              <Alert visible={!!error?.message} text={error?.message || ''} />
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
              <SubmitButton text="Submit" type="submit" loading={loading} />
            </>
          )}
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
  min-height: 350px;
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
