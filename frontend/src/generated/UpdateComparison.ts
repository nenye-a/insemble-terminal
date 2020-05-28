/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReviewTag, BusinessTagInput, LocationTagInput, CompareActionType, LocationTagType, BusinessType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateComparison
// ====================================================

export interface UpdateComparison_updateComparison_comparationTags_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface UpdateComparison_updateComparison_comparationTags_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface UpdateComparison_updateComparison_comparationTags {
  __typename: "ComparationTag";
  id: string;
  locationTag: UpdateComparison_updateComparison_comparationTags_locationTag | null;
  businessTag: UpdateComparison_updateComparison_comparationTags_businessTag | null;
}

export interface UpdateComparison_updateComparison {
  __typename: "ComparisonMutation";
  comparationTags: UpdateComparison_updateComparison_comparationTags[];
  reviewTag: ReviewTag;
  tableId: string;
}

export interface UpdateComparison {
  updateComparison: UpdateComparison_updateComparison;
}

export interface UpdateComparisonVariables {
  reviewTag: ReviewTag;
  businessTag?: BusinessTagInput | null;
  businessTagId?: string | null;
  locationTag?: LocationTagInput | null;
  tableId: string;
  comparationTagId?: string | null;
  actionType: CompareActionType;
}
