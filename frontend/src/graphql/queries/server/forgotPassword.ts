import gql from 'graphql-tag';

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($password: String!, $verificationCode: String!) {
    resetPassword(password: $password, verificationCode: $verificationCode) {
      message
      verificationId
    }
  }
`;

export const RESET_PASSWORD_VERIFICATION = gql`
  query ResetPasswordVerification($verificationCode: String!) {
    resetPasswordVerification(verificationCode: $verificationCode) {
      message
      verificationId
    }
  }
`;
