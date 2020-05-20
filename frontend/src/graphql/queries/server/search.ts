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
    }
  }
`;
