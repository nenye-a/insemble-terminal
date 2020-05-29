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
