/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserRegisterInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserRegister
// ====================================================

export interface UserRegister_register {
  __typename: "UserRegisterResult";
  message: string;
  verificationId: string;
}

export interface UserRegister {
  register: UserRegister_register;
}

export interface UserRegisterVariables {
  user: UserRegisterInput;
}
