/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserLogin
// ====================================================

export interface UserLogin_login_user {
  __typename: "User";
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  company: string;
}

export interface UserLogin_login {
  __typename: "Auth";
  token: string;
  user: UserLogin_login_user;
}

export interface UserLogin {
  login: UserLogin_login;
}

export interface UserLoginVariables {
  email: string;
  password: string;
}
