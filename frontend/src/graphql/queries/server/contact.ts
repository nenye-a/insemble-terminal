import gql from 'graphql-tag';

export const CONTACT_US = gql`
  mutation ContactUs(
    $firstName: String
    $lastName: String
    $company: String
    $email: String
    $msg: String!
  ) {
    contactUs(
      firstName: $firstName
      lastName: $lastName
      company: $company
      email: $email
      msg: $msg
    )
  }
`;
