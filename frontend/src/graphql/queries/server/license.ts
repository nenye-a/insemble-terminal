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

export const GET_MASTER_TOKENS = gql`
  query GetMasterTokens {
    masterLicenseList {
      masterToken
      name
      numToken
    }
  }
`;

export const GET_TOKENS = gql`
  query GetTokens {
    licenseList {
      token
      linkedEmail
    }
  }
`;

export const REMOVE_TOKENS = gql`
  mutation RemoveTokens($tokens: [String!]!) {
    removeLicenses(tokens: $tokens)
  }
`;

export const REMOVE_MASTER_TOKENS = gql`
  mutation RemoveMasterTokens($masterTokens: [String!]!) {
    removeMasterLicenses(masterTokens: $masterTokens)
  }
`;

export const INCREMENT_MAX_TOKEN = gql`
  mutation IncrementMaxToken($masterTokens: [String!]!) {
    incrementMaxLicense(masterTokens: $masterTokens)
  }
`;
