import {
  ReviewTag,
  LocationTagType,
  BusinessType,
  BusinessTagInput,
  LocationTagInput,
} from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import {
  GetPerformanceTable_performanceTable_table_data as PerformanceData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceCompareData,
} from '../generated/GetPerformanceTable';
import {
  GetNewsTable_newsTable_table_data as NewsData,
  GetNewsTable_newsTable_table_compareData as NewsCompareData,
} from '../generated/GetNewsTable';
import {
  GetActivity_activityTable_table_data as ActivityData,
  GetActivity_activityTable_table_compareData as ActivityCompareData,
} from '../generated/GetActivity';
import {
  GetCoverage_coverageTable_data as CoverageData,
  GetCoverage_coverageTable_compareData as CoverageCompareData,
} from '../generated/GetCoverage';

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

export type ComparationTagWithFill = ComparationTag & {
  fill?: string;
};

export enum OwnershipType {
  COMPANY_INFORMATION = 'COMPANY_INFORMATION',
  COMPANY_CONTACT = 'COMPANY_CONTACT',
  PROPERTY_CONTACT = 'PROPERTY_CONTACT',
  PROPERTY_INFORMATION = 'PROPERTY_INFORMATION',
}

export type CoverageWithFill = (CoverageData | CoverageCompareData) & {
  fill: string;
};

export type LocationLatLng = {
  lat: number;
  lng: number;
};

export type SearchTag = {
  reviewTag?: ReviewTag | null;
  businessTag?: BusinessTagInput | null;
  businessTagWithId?: Omit<BusinessTag, '__typename'> | null;
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

export type WithFillAndComparison = {
  fill?: string;
  isComparison: boolean;
};
export type MergedPerformanceData = (PerformanceData | PerformanceCompareData) &
  WithFillAndComparison;

export type MergedNewsData = (NewsData | NewsCompareData) &
  WithFillAndComparison;

export type MergedActivityData = (ActivityData | ActivityCompareData) &
  WithFillAndComparison;
export type MergedCoverageData = (CoverageData | CoverageCompareData) &
  WithFillAndComparison;

export type HasCompareId = {
  compareId: string;
};
