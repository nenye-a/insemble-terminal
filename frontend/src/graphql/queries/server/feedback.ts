import gql from 'graphql-tag';

export const SEND_FEEDBACK = gql`
  mutation SendFeedback(
    $feedbackTitle: String!
    $tableType: TableType
    $customFeed: String
    $tableId: String
    $feedbackDetail: String
  ) {
    feedback(
      feedbackTitle: $feedbackTitle
      tableType: $tableType
      customFeed: $customFeed
      tableId: $tableId
      feedbackDetail: $feedbackDetail
    )
  }
`;
