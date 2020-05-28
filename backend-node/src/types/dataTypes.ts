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
