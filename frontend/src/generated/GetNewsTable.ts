/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BusinessType, LocationTagType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetNewsTable
// ====================================================

export interface GetNewsTable_newsTable_businessTag {
  __typename: "BusinessTag";
  params: string;
  type: BusinessType;
}

export interface GetNewsTable_newsTable_locationTag {
  __typename: "LocationTag";
  params: string;
  type: LocationTagType;
}

export interface GetNewsTable_newsTable_comparationTags_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface GetNewsTable_newsTable_comparationTags_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface GetNewsTable_newsTable_comparationTags {
  __typename: "ComparationTag";
  id: string;
  locationTag: GetNewsTable_newsTable_comparationTags_locationTag | null;
  businessTag: GetNewsTable_newsTable_comparationTags_businessTag | null;
}

export interface GetNewsTable_newsTable_data {
  __typename: "NewsData";
  title: string;
  link: string;
  source: string;
  published: string;
}

export interface GetNewsTable_newsTable_compareData {
  __typename: "CompareNewsData";
  title: string;
  link: string;
  source: string;
  published: string;
}

export interface GetNewsTable_newsTable {
  __typename: "News";
  id: string;
  businessTag: GetNewsTable_newsTable_businessTag | null;
  locationTag: GetNewsTable_newsTable_locationTag | null;
  comparationTags: GetNewsTable_newsTable_comparationTags[];
  data: GetNewsTable_newsTable_data[];
  compareData: GetNewsTable_newsTable_compareData[];
}

export interface GetNewsTable {
  newsTable: GetNewsTable_newsTable;
}

export interface GetNewsTableVariables {
  businessTagId?: string | null;
  locationTagId?: string | null;
  tableId?: string | null;
}
