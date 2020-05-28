/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserRegisterVerification
// ====================================================

export interface UserRegisterVerification_userRegisterVerification_auth {
  __typename: "Auth";
  token: string;
}

export interface UserRegisterVerification_userRegisterVerification {
  __typename: "UserRegisterVerification";
  id: string;
  verified: boolean;
  auth: UserRegisterVerification_userRegisterVerification_auth | null;
}

export interface UserRegisterVerification {
  userRegisterVerification: UserRegisterVerification_userRegisterVerification;
}

export interface UserRegisterVerificationVariables {
  verificationId: string;
}
