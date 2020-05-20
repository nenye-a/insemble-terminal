/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BusinessType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetBusinessTag
// ====================================================

export interface GetBusinessTag_businessTags {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface GetBusinessTag {
  businessTags: GetBusinessTag_businessTags[];
}
