/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserProfile
// ====================================================

export interface GetUserProfile_userProfile {
  __typename: "User";
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  company: string;
  description: string | null;
  title: string | null;
  address: string | null;
  pendingEmail: boolean;
}

export interface GetUserProfile {
  userProfile: GetUserProfile_userProfile;
}
