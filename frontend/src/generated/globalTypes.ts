/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BusinessTagType {
  BUSINESS = "BUSINESS",
  CATEGORY = "CATEGORY",
}

export enum BusinessType {
  BUSINESS = "BUSINESS",
  CATEGORY = "CATEGORY",
}

export enum CompareActionType {
  ADD = "ADD",
  DELETE = "DELETE",
}

export enum LocationTagType {
  ADDRESS = "ADDRESS",
  CITY = "CITY",
  COUNTY = "COUNTY",
  NATION = "NATION",
  STATE = "STATE",
}

export enum PerformanceTableType {
  ADDRESS = "ADDRESS",
  BRAND = "BRAND",
  CATEGORY = "CATEGORY",
  CITY = "CITY",
  OVERALL = "OVERALL",
  STATE = "STATE",
}

export enum PerformanceType {
  ADDRESS = "ADDRESS",
  BRAND = "BRAND",
  CATEGORY = "CATEGORY",
  CITY = "CITY",
  OVERALL = "OVERALL",
  STATE = "STATE",
}

export enum ReviewTag {
  COVERAGE = "COVERAGE",
  NEWS = "NEWS",
  OWNERSHIP = "OWNERSHIP",
  PERFORMANCE = "PERFORMANCE",
}

export interface BusinessTagInput {
  params: string;
  type: BusinessTagType;
}

export interface LocationTagInput {
  params: string;
  type: LocationTagType;
}

export interface UserRegisterInput {
  company: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
