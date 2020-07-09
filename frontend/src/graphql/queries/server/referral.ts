import gql from 'graphql-tag';

export const CREATE_REFERRAL = gql`
  mutation CreateReferral($referredData: ReferredDataInput!) {
    createReferral(referredData: $referredData)
  }
`;
