import {
  ReviewTag,
  LocationTagType,
  BusinessType,
  BusinessTagInput,
  LocationTagInput,
} from '../generated/globalTypes';
import {
  GetCoverage_coverageTable_data as CoverageTableData,
  GetCoverage_coverageTable_compareData as CoverageTableCompareData,
} from '../generated/GetCoverage';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';

export type ResultQuery = {
  reviewTag: ReviewTag | null;
  type: string; // TODO: change to BE enum
};

export type LocationTag = {
  id: string;
  params: string;
  type: LocationTagType;
} | null;

export type BusinessTagResult = {
  id: string;
  params: string;
  type: BusinessType;
} | null;

export type ComparationTag = {
  id: string;
  locationTag: LocationTag;
  businessTag: BusinessTagResult;
};

export enum OwnershipType {
  COMPANY_INFORMATION = 'COMPANY_INFORMATION',
  COMPANY_CONTACT = 'COMPANY_CONTACT',
  PROPERTY_CONTACT = 'PROPERTY_CONTACT',
  PROPERTY_INFORMATION = 'PROPERTY_INFORMATION',
}

export type CoverageWithFill = (
  | CoverageTableData
  | CoverageTableCompareData
) & {
  fill: string;
};

export type LocationLatLng = {
  lat: number;
  lng: number;
};

export type SearchTag = {
  reviewTag?: ReviewTag | null;
  businessTag?: BusinessTagInput | null;
  businessTagWithId?: BusinessTag | null;
  locationTag?: LocationTagInput | null;
};

export enum Direction {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export type SearchParams = {
  reviewTag?: ReviewTag | null;
  businessTag?: {
    type: BusinessType;
    params: string;
  } | null;
  locationTag?: { type: LocationTagType; params: string } | null;
};
