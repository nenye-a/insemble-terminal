/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReviewTag, BusinessTagInput, LocationTagInput, LocationTagType, BusinessType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AddComparison
// ====================================================

export interface AddComparison_addComparison_comparationTags_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface AddComparison_addComparison_comparationTags_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface AddComparison_addComparison_comparationTags {
  __typename: "ComparationTag";
  id: string;
  locationTag: AddComparison_addComparison_comparationTags_locationTag | null;
  businessTag: AddComparison_addComparison_comparationTags_businessTag | null;
}

export interface AddComparison_addComparison {
  __typename: "ComparisonMutation";
  comparationTags: AddComparison_addComparison_comparationTags[];
  reviewTag: ReviewTag;
  tableId: string;
}

export interface AddComparison {
  addComparison: AddComparison_addComparison;
}

export interface AddComparisonVariables {
  reviewTag: ReviewTag;
  businessTag?: BusinessTagInput | null;
  businessTagId?: string | null;
  locationTag?: LocationTagInput | null;
  tableId: string;
}
