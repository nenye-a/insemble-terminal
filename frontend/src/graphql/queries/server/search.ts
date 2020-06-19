import gql from 'graphql-tag';

export const SEARCH = gql`
  mutation Search(
    $reviewTag: ReviewTag
    $businessTag: BusinessTagInput
    $businessTagId: String
    $locationTag: LocationTagInput
  ) {
    search(
      reviewTag: $reviewTag
      businessTag: $businessTag
      businessTagId: $businessTagId
      locationTag: $locationTag
    ) {
      reviewTag
      businessTag {
        id
        params
        type
      }
      locationTag {
        id
        params
        type
      }
      searchId
    }
  }
`;

export const GET_SEARCH_TAG = gql`
  query GetSearchTag($searchId: String!) {
    search(searchId: $searchId) {
      reviewTag
      businessTag {
        id
        params
        type
      }
      locationTag {
        id
        params
        type
      }
      searchId
    }
  }
`;
