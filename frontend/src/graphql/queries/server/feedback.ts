import gql from 'graphql-tag';

export const SEND_FEEDBACK = gql`
  mutation SendFeedback(
    $feedbackTitle: String!
    $tableType: TableType!
    $tableId: String!
    $feedbackDetail: String
  ) {
    feedback(
      feedbackTitle: $feedbackTitle
      tableType: $tableType
      tableId: $tableId
      feedbackDetail: $feedbackDetail
    )
  }
`;
