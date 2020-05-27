import gql from 'graphql-tag';

export const ADD_COMPARISON = gql`
  mutation AddComparison(
    $reviewTag: ReviewTag!
    $businessTag: BusinessTagInput
    $businessTagId: String
    $locationTag: LocationTagInput
    $tableId: String!
  ) {
    addComparison(
      reviewTag: $reviewTag
      businessTag: $businessTag
      businessTagId: $businessTagId
      locationTag: $locationTag
      tableId: $tableId
    ) {
      comparationTags {
        id
        locationTag {
          id
          params
          type
        }
        businessTag {
          id
          params
          type
        }
      }
      reviewTag
      tableId
    }
  }
`;
