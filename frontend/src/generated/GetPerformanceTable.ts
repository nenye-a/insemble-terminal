/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PerformanceTableType, PerformanceType, BusinessType, LocationTagType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPerformanceTable
// ====================================================

export interface GetPerformanceTable_performanceTable_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface GetPerformanceTable_performanceTable_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface GetPerformanceTable_performanceTable_data {
  __typename: "PerformanceData";
  id: string;
  name: string;
  avgRating: string;
  numLocation: number | null;
  numReview: number;
  totalSales: string;
}

export interface GetPerformanceTable_performanceTable_compareData {
  __typename: "ComparePerformanceData";
  id: string;
  name: string;
  avgRating: string;
  numLocation: number | null;
  numReview: number;
  totalSales: string;
}

export interface GetPerformanceTable_performanceTable_comparationTags_locationTag {
  __typename: "LocationTag";
  id: string;
  params: string;
  type: LocationTagType;
}

export interface GetPerformanceTable_performanceTable_comparationTags_businessTag {
  __typename: "BusinessTag";
  id: string;
  params: string;
  type: BusinessType;
}

export interface GetPerformanceTable_performanceTable_comparationTags {
  __typename: "ComparationTag";
  id: string;
  locationTag: GetPerformanceTable_performanceTable_comparationTags_locationTag | null;
  businessTag: GetPerformanceTable_performanceTable_comparationTags_businessTag | null;
}

export interface GetPerformanceTable_performanceTable {
  __typename: "Performance";
  id: string;
  type: PerformanceType;
  businessTag: GetPerformanceTable_performanceTable_businessTag | null;
  locationTag: GetPerformanceTable_performanceTable_locationTag | null;
  data: GetPerformanceTable_performanceTable_data[];
  compareData: GetPerformanceTable_performanceTable_compareData[];
  comparationTags: GetPerformanceTable_performanceTable_comparationTags[];
}

export interface GetPerformanceTable {
  performanceTable: GetPerformanceTable_performanceTable;
}

export interface GetPerformanceTableVariables {
  performanceType: PerformanceTableType;
  businessTagId?: string | null;
  locationTagId?: string | null;
  tableId?: string | null;
}
