/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReviewTag, BusinessTagInput, LocationTagInput, BusinessType, LocationTagType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: Search
// ====================================================

export interface Search_search_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface Search_search_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface Search_search {
  __typename: "Search";
  reviewTag: ReviewTag | null;
  businessTag: Search_search_businessTag | null;
  locationTag: Search_search_locationTag | null;
}

export interface Search {
  search: Search_search;
}

export interface SearchVariables {
  reviewTag?: ReviewTag | null;
  businessTag?: BusinessTagInput | null;
  businessTagId?: string | null;
  locationTag?: LocationTagInput | null;
}
