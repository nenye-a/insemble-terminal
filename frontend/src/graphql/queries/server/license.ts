import gql from 'graphql-tag';

export const ACTIVATE_ACCOUNT = gql`
  mutation ActivateAccount($activationToken: String!) {
    activateAccount(activationToken: $activationToken) {
      email
      firstName
      lastName
      role
      license
    }
  }
`;
