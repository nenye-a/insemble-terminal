import gql from 'graphql-tag';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      email
      firstName
      lastName
      avatar
      company
      description
      title
      address
      pendingEmail
      role
      license
    }
  }
`;

export const EDIT_USER_PROFILE = gql`
  mutation EditUserProfile($profile: EditProfileInput!) {
    editUserProfile(profile: $profile) {
      id
    }
  }
`;
