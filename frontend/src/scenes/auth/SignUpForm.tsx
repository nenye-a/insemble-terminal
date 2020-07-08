import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';

import {
  View,
  TextInput,
  Form,
  Button,
  Alert,
  Checkbox,
  Text,
  Link as BaseLink,
  LoadingIndicator,
} from '../../core-ui';
import { WHITE, LINK_COLOR } from '../../constants/colors';
import {
  UserRegister,
  UserRegisterVariables,
} from '../../generated/UserRegister';
import {
  GetReferredData,
  GetReferredDataVariables,
} from '../../generated/GetReferredData';
import {
  USER_REGISTER,
  GET_REFERRED_USER_DATA,
} from '../../graphql/queries/server/auth';
import { validateEmail } from '../../helpers';
import { TERMS_OF_SERVICE_PDF, PRIVACY_POLICY_PDF } from '../../constants/uri';
import {
  TERMS_OF_SERVICE_ROUTE,
  PRIVACY_POLICY_ROUTE,
} from '../../constants/trackEvents';

type Props = {
  referralCode?: string;
};

export default function SignUpForm(props: Props) {
  let [hasAgreed, setHasAgreed] = useState(false);
  let [defaultForm, setDefaultForm] = useState({
    defaultEmail: '',
    defaultFirstName: '',
    defaultLastName: '',
    defaultCompany: '',
  });
  let { referralCode } = props;
  let { register, handleSubmit, errors, watch } = useForm();

  let [registerUser, { data, loading, error }] = useMutation<
    UserRegister,
    UserRegisterVariables
  >(USER_REGISTER);
  let [getReferredData, { loading: loadingReferredData }] = useLazyQuery<
    GetReferredData,
    GetReferredDataVariables
  >(GET_REFERRED_USER_DATA, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: {
      referralCode: referralCode || '',
    },
    onCompleted: (data) => {
      if (data) {
        setDefaultForm({
          defaultEmail: data.referredData.email,
          defaultFirstName: data.referredData.firstName,
          defaultLastName: data.referredData.lastName,
          defaultCompany: data.referredData.company,
        });
      }
    },
  });

  useEffect(() => {
    getReferredData();
  }, [getReferredData]);

  let errorMessage = error?.message;

  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let trackEvent = (route: string) => {
    ReactGA.pageview(route);
  };

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
          referralCode,
        },
      });
    }
  };

  if (loadingReferredData) {
    return <LoadingIndicator />;
  }

  if (data) {
    if (data.register.message === 'success') {
      return (
        <Redirect to={`/email-verification/${data.register.verificationId}`} />
      );
    }
  }
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
          defaultValue={defaultForm.defaultEmail}
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
              defaultValue={defaultForm.defaultFirstName}
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
              defaultValue={defaultForm.defaultLastName}
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
          defaultValue={defaultForm.defaultCompany}
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
              <Link
                href={PRIVACY_POLICY_PDF}
                onPress={() => {
                  trackEvent(PRIVACY_POLICY_ROUTE);
                }}
                style={{ color: LINK_COLOR }}
              >
                Privacy Policy
              </Link>
              <SmallText> and the </SmallText>
              <Link
                href={TERMS_OF_SERVICE_PDF}
                onPress={() => {
                  trackEvent(TERMS_OF_SERVICE_ROUTE);
                }}
                style={{ color: LINK_COLOR }}
              >
                Terms of Service
              </Link>
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
