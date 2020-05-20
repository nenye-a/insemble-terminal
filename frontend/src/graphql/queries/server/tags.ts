import gql from 'graphql-tag';

export const GET_BUSINESS_TAG = gql`
  query GetBusinessTag {
    businessTags {
      id
      params
      type
    }
  }
`;
