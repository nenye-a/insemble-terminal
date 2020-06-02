export type PyPerformanceData = {
  name?: string;
  salesVolumeIndex?: number;
  avgRating?: number;
  avgReviews?: number;
  numLocations?: number;
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

export type PyCoverageLocations = {
  lat: number;
  lng: number;
  name: string;
  address: string;
  num_reviews: number;
};

export type PyCoverageBusiness = {
  business_name: string;
  num_locations: number;
  locations: Array<PyCoverageLocations>;
};

export type PyCoverageData = {
  name: string;
  location: string;
  num_locations: number;
  coverage: Array<PyCoverageBusiness>;
};

export type PyCoverageResponse = {
  createdAt: Date;
  updatedAt: Date;
  data: PyCoverageData[];
};

export type ActivityGraphData = {
  name: string;
  business: string;
  amount: number;
};

export type LocationPin = {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  numReviews?: number;
};

export type BusinessData = {
  businessName?: string;
  numLocations?: number;
  locations: Array<LocationPin>;
};
