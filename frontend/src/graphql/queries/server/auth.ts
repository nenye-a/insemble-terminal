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
