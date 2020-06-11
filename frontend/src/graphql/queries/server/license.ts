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

export const CREATE_TOKEN = gql`
  mutation CreateToken($masterName: String!, $numToken: Int!) {
    createLicense(masterName: $masterName, numToken: $numToken) {
      masterToken
      tokens
    }
  }
`;
