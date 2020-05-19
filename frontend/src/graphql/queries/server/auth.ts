import gql from 'graphql-tag';

export const USER_LOGIN = gql`
  mutation UserLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        avatar
        company
      }
    }
  }
`;

export const USER_REGISTER = gql`
  mutation UserRegister($user: UserRegisterInput!) {
    register(user: $user) {
      message
      verificationId
    }
  }
`;

export const USER_REGISTER_VERIFICATION = gql`
  query UserRegisterVerification($verificationId: String!) {
    userRegisterVerification(verificationId: $verificationId) {
      id
      verified
      auth {
        token
      }
    }
  }
`;
