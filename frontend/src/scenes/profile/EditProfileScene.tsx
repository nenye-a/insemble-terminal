import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/react-hooks';

import {
  Card,
  Text,
  Button,
  TextInput,
  View,
  Form,
  LoadingIndicator,
  Alert,
} from '../../core-ui';
import { ReferralButton } from '../../components';
import { THEME_COLOR } from '../../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import {
  EDIT_USER_PROFILE,
  GET_USER_PROFILE,
} from '../../graphql/queries/server/profile';
import {
  EditUserProfile,
  EditUserProfileVariables,
} from '../../generated/EditUserProfile';
import { GetUserProfile } from '../../generated/GetUserProfile';

export default function EditProfileScene() {
  let { register, watch, handleSubmit, errors } = useForm();
  let { data: userData, loading: userLoading, refetch: userRefetch } = useQuery<
    GetUserProfile
  >(GET_USER_PROFILE, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });

  let [
    editProfile,
    {
      data: editProfileData,
      loading: editProfileLoading,
      error: editProfileError,
    },
  ] = useMutation<EditUserProfile, EditUserProfileVariables>(
    EDIT_USER_PROFILE,
    {
      onCompleted: () => {
        userRefetch();
      },
      onError: () => {},
    },
  );

  let onSubmit = (fieldValues: FieldValues) => {
    let {
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      address,
      description,
      currentPassword,
      newPassword,
    } = fieldValues;
    if (Object.keys(errors).length === 0) {
      editProfile({
        variables: {
          profile: {
            email,
            firstName,
            lastName,
            company,
            title: jobTitle,
            address,
            description,
            oldPassword: currentPassword,
            newPassword,
          },
        },
        refetchQueries: [
          {
            query: GET_USER_PROFILE,
          },
        ],
      });
    }
  };

  let errorMessage = editProfileError?.message || '';
  let textInputContainerStyle = { marginTop: 12, marginBottom: 12 };

  return (
    <>
      <ReferralButton style={{ position: 'absolute', right: 24, top: 36 }} />
      <Container flex>
        {userLoading ? (
          <LoadingIndicator />
        ) : (
          !editProfileLoading &&
          !userLoading &&
          userData?.userProfile && (
            <Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <Alert
                visible={!!editProfileData}
                text="Your profile has been updated"
              />
              <Alert visible={!!errorMessage} text={errorMessage} />
              <RowedView>
                <Title>Profile</Title>
              </RowedView>
              <TextInput
                label="Email Address"
                placeholder="Email"
                defaultValue={userData.userProfile.email}
                name="email"
                containerStyle={textInputContainerStyle}
                errorMessage={
                  userData.userProfile.pendingEmail
                    ? 'Your account is pending for e-mail verification. Please check your new e-mail'
                    : ''
                }
                ref={register({
                  required: 'Email should not be empty',
                })}
              />
              <RowedView>
                <TextInput
                  label="First Name"
                  placeholder="First Name"
                  defaultValue={userData.userProfile.firstName}
                  name="firstName"
                  containerStyle={{ ...textInputContainerStyle, flex: 1 }}
                  ref={register({
                    required: 'First name should not be empty',
                  })}
                  {...(errors?.firstName?.message && {
                    errorMessage: errors.firstName.message,
                  })}
                />
                <Spacing />
                <TextInput
                  label="Last Name"
                  placeholder="Last Name"
                  defaultValue={userData.userProfile.lastName}
                  name="lastName"
                  containerStyle={{ ...textInputContainerStyle, flex: 1 }}
                  ref={register({
                    required: 'Last name should not be empty',
                  })}
                  {...(errors?.lastName?.message && {
                    errorMessage: errors.lastName.message,
                  })}
                />
              </RowedView>
              <RowedView>
                <TextInput
                  label="Company"
                  placeholder="Company"
                  defaultValue={userData.userProfile.company}
                  name="company"
                  containerStyle={{ ...textInputContainerStyle, flex: 1 }}
                  ref={register}
                  {...(errors?.company?.message && {
                    errorMessage: errors.company.message,
                  })}
                />
                <Spacing />
                <TextInput
                  label="Title"
                  placeholder="Job Title"
                  defaultValue={
                    userData.userProfile.title ? userData.userProfile.title : ''
                  }
                  name="jobTitle"
                  containerStyle={{ ...textInputContainerStyle, flex: 1 }}
                  ref={register}
                  {...(errors?.jobTitle?.message && {
                    errorMessage: errors.jobTitle.message,
                  })}
                />
              </RowedView>
              <TextInput
                label="Address"
                placeholder="Address"
                defaultValue={
                  userData.userProfile.address
                    ? userData.userProfile.address
                    : ''
                }
                name="address"
                containerStyle={{
                  ...textInputContainerStyle,
                  width: `calc(50% - ${(SPACING_WIDTH / 2).toString() + 'px'})`,
                }}
                ref={register}
                {...(errors?.address?.message && {
                  errorMessage: errors.address.message,
                })}
              />

              <Title>Password</Title>
              <TextInput
                label="Current Password"
                placeholder="Enter Your Current Password"
                type="password"
                name="currentPassword"
                containerStyle={textInputContainerStyle}
                ref={register}
                {...(errors?.password?.message && {
                  errorMessage: errors.password.message,
                })}
                autoComplete="new-password"
              />
              <TextInput
                label="New Password"
                placeholder="Enter Your New Password"
                type="password"
                name="newPassword"
                ref={register({
                  required: watch('currentPassword')
                    ? 'New password should not be empty'
                    : false,
                })}
                {...(errors?.newPassword?.message && {
                  errorMessage: errors.newPassword.message,
                })}
              />
              <TextInput
                label="Confirm New Password"
                placeholder="Re-Enter Your New Password"
                type="password"
                name="confirmNewPassword"
                containerStyle={textInputContainerStyle}
                ref={register({
                  required: watch('newPassword')
                    ? 'Confirm password should not be empty'
                    : false,
                  ...(watch('newPassword') && {
                    validate: (val) =>
                      val === watch('newPassword') ||
                      'Confirm password does not match',
                  }),
                })}
                {...(errors?.confirmNewPassword?.message && {
                  errorMessage: errors.confirmNewPassword.message,
                })}
              />
              <SaveButton
                text="Save Changes"
                type="submit"
                loading={editProfileLoading}
              />
            </Form>
          )
        )}
      </Container>
    </>
  );
}

const SPACING_WIDTH = 24;
const Container = styled(Card)`
  padding: 12px 24px;
  width: 700px;
  align-self: center;
  margin: 24px;
`;

const RowedView = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
  margin: 12px 0;
`;

const Spacing = styled(View)`
  width: ${SPACING_WIDTH.toString() + 'px'};
`;

const SaveButton = styled(Button)`
  align-self: flex-end;
  margin: 12px 0;
`;
