import gql from 'graphql-tag';

export const UPDATE_COMPARISON = gql`
  mutation UpdateComparison(
    $reviewTag: ReviewTag!
    $businessTag: BusinessTagInput
    $businessTagId: String
    $locationTag: LocationTagInput
    $tableId: String!
    $comparationTagId: String
    $actionType: CompareActionType!
  ) {
    updateComparison(
      reviewTag: $reviewTag
      businessTag: $businessTag
      businessTagId: $businessTagId
      locationTag: $locationTag
      tableId: $tableId
      comparationTagId: $comparationTagId
      actionType: $actionType
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
