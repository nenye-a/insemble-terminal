import {
  TableType,
  PerformanceType,
  OwnershipType,
  BusinessTag,
  LocationTag,
} from '@prisma/client';

export type PyPerformanceData = {
  name?: string;
  customerVolumeIndex?: number;
  localRetailIndex?: number;
  localCategoryIndex?: number;
  nationalIndex?: number;
  avgRating?: number;
  avgReviews?: number;
  numLocations?: number;
  numNearby?: number;
};

export type PyPerformanceResponse = {
  createdAt: Date;
  updatedAt: Date;
  dataType: 'BRAND' | 'CATEGORY' | 'OVERALL' | 'ADDRESS' | 'CITY' | 'STATE';
  data: Array<PyPerformanceData>;
};

export type PyNewsData = {
  title?: string;
  link?: string;
  published?: string;
  source?: string;
  description?: string;
  relevance?: number;
};

export type PyNewsResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: Array<PyNewsData>;
};

export type PyActivityTimes = {
  '12AM'?: number;
  '1AM'?: number;
  '2AM'?: number;
  '3AM'?: number;
  '4AM'?: number;
  '5AM'?: number;
  '6AM'?: number;
  '7AM'?: number;
  '8AM'?: number;
  '9AM'?: number;
  '10AM'?: number;
  '11AM'?: number;
  '12PM'?: number;
  '1PM'?: number;
  '2PM'?: number;
  '3PM'?: number;
  '4PM'?: number;
  '5PM'?: number;
  '6PM'?: number;
  '7PM'?: number;
  '8PM'?: number;
  '9PM'?: number;
  '10PM'?: number;
  '11PM'?: number;
};

export type PyActivityData = {
  name: string;
  location: string;
  activity: PyActivityTimes;
};

export type PyActivityResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: Array<PyActivityData>;
};

export type PyMapLocations = {
  lat: number;
  lng: number;
  name: string;
  rating: number;
  address: string;
  num_reviews: number;
};

export type PyMapBusiness = {
  business_name: string;
  num_locations: number;
  locations: Array<PyMapLocations>;
};

export type PyMapData = {
  name: string;
  location: string;
  num_locations: number;
  coverage: Array<PyMapBusiness>;
};

export type PyMapResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: PyMapData[];
};

export type PyContactData = {
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
};

export type PyOwnershipContactResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: PyContactData[];
};

export type PyInfoData = {
  parent_company?: string;
  headquarters?: string;
  phone?: string;
  website?: string;
  last_update?: string;
};

export type PyOwnershipInfoResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: PyInfoData;
};

export type PyPreprocessingResponse = {
  business_name?: string;
};

export type ActivityGraphData = {
  name: string;
  business: string;
  amount: number | null;
};

export type LocationPin = {
  lat: number;
  lng: number;
  name?: string;
  rating?: number;
  address?: string;
  numReviews?: number;
};

export type BusinessData = {
  businessName?: string;
  numLocations?: string;
  locations: Array<LocationPin>;
};

export type LicenseToken = {
  token: string;
  linkedEmail: string;
};

export type TableParams = {
  tableType?: TableType;
  type?: AllTableType;
  businessTag?: BusinessTag;
  locationTag?: LocationTag;
};

export type FirstArticle = {
  title: string;
  source: string;
  published: string;
  link: string;
};

export type OpenNewsData = {
  title: string;
  source: string;
  description: string;
  published: string;
  relevance: number;
  link: string;
};

export type AllTableType = PerformanceType | OwnershipType;

export type RefferedData = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
};
