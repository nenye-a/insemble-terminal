import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';
import { Redirect } from 'react-router-dom';

import {
  View,
  TextInput,
  Form,
  Button,
  Alert,
  Checkbox,
  Text,
  Link as BaseLink,
} from '../../core-ui';
import { WHITE } from '../../constants/colors';
import {
  UserRegister,
  UserRegisterVariables,
} from '../../generated/UserRegister';
import { USER_REGISTER } from '../../graphql/queries/server/auth';
import { validateEmail } from '../../helpers';

export default function SignUpForm() {
  let [hasAgreed, setHasAgreed] = useState(false);
  let { register, handleSubmit, errors, watch } = useForm();

  let [registerUser, { data, loading, error }] = useMutation<
    UserRegister,
    UserRegisterVariables
  >(USER_REGISTER);
  let errorMessage = error?.message;

  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (data: FieldValues) => {
    if (hasAgreed && Object.keys(errors).length === 0) {
      let { email, firstName, lastName, company, password } = data;
      registerUser({
        variables: {
          user: {
            email,
            firstName,
            lastName,
            company,
            password,
          },
        },
      });
    }
  };

  // if (data) {
  //   if (data.register.message === 'success') {
  //     return (
  //       <Redirect to={`/email-verification/${data.register.verificationId}`} />
  //     );
  //   }
  // }
  console.log(data, error, loading);
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && <Alert visible={true} text={errorMessage} />}
      <FormContent>
        <TextInput
          name="email"
          ref={register({
            required: 'Email should not be empty',
            validate: (val) => validateEmail(val) || 'Incorrect email format',
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
        <TextInput
          name="password"
          ref={register({
            required: 'Password should not be empty',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          label="Password"
          placeholder="Enter Password"
          type="password"
          {...(errors?.password?.message && {
            errorMessage: errors.password.message,
          })}
          containerStyle={inputContainerStyle}
        />
        <TextInput
          name="confirmPassword"
          ref={register({
            required: 'Confirm password should not be empty',
            validate: (val) =>
              val === watch('password') || 'Confirm password does not match',
          })}
          label="Confirm Password"
          placeholder="Re-enter Password"
          type="password"
          {...(errors?.confirmPassword?.message && {
            errorMessage: errors.confirmPassword.message,
          })}
          containerStyle={inputContainerStyle}
        />
        <Checkbox
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SmallText> I accept the </SmallText>
              {/* TODO: add href */}
              <Link href="">Privacy Policy</Link>
              <SmallText> and the </SmallText>
              <Link href="">Terms of Service</Link>
            </View>
          }
          size="13px"
          isChecked={hasAgreed}
          onPress={() => setHasAgreed(!hasAgreed)}
        />
        <SubmitButton
          text="Create an Account"
          type="submit"
          loading={loading}
        />
      </FormContent>
    </Form>
  );
}

const FormContent = styled(View)`
  background-color: ${WHITE};
`;

const RowedView = styled(View)`
  flex-direction: row;
`;
const SubmitButton = styled(Button)`
  margin: 15px 0 30px 0;
`;
const SmallText = styled(Text)`
  font-size: 11px;
`;
const Link = styled(BaseLink)`
  font-size: 11px;
`;
