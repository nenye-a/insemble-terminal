import {
  ReviewTag,
  LocationTagType,
  BusinessType,
} from '../generated/globalTypes';

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
