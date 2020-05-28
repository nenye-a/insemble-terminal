/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReviewTag, LocationTagType, BusinessType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteComparison
// ====================================================

export interface DeleteComparison_deleteComparison_comparationTags_locationTag {
  __typename: "LocationTag";
  params: string;
  type: LocationTagType;
}

export interface DeleteComparison_deleteComparison_comparationTags_businessTag {
  __typename: "BusinessTag";
  params: string;
  type: BusinessType;
}

export interface DeleteComparison_deleteComparison_comparationTags {
  __typename: "ComparationTag";
  id: string;
  locationTag: DeleteComparison_deleteComparison_comparationTags_locationTag | null;
  businessTag: DeleteComparison_deleteComparison_comparationTags_businessTag | null;
}

export interface DeleteComparison_deleteComparison {
  __typename: "ComparisonMutation";
  comparationTags: DeleteComparison_deleteComparison_comparationTags[];
  reviewTag: ReviewTag;
  tableId: string;
}

export interface DeleteComparison {
  deleteComparison: DeleteComparison_deleteComparison;
}

export interface DeleteComparisonVariables {
  reviewTag: ReviewTag;
  comparationTagId: string;
  tableId: string;
}
