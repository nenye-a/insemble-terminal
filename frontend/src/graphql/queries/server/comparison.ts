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

export const DELETE_COMPARISON = gql`
  mutation DeleteComparison(
    $reviewTag: ReviewTag!
    $comparationTagId: String!
    $tableId: String!
  ) {
    deleteComparison(
      reviewTag: $reviewTag
      comparationTagId: $comparationTagId
      tableId: $tableId
    ) {
      comparationTags {
        id
        locationTag {
          params
          type
        }
        businessTag {
          params
          type
        }
      }
      reviewTag
      tableId
    }
  }
`;
