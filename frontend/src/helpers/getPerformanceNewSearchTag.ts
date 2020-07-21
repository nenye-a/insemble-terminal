import {
  PerformanceTableType,
  LocationTagType,
  BusinessTagType,
} from '../generated/globalTypes';

type NewSearchTag = {
  locationType?: LocationTagType;
  businessType?: BusinessTagType;
};

export default function getPerformanceNewSearchTag(
  performanceType: PerformanceTableType,
): NewSearchTag {
  /**
   * To determine the new search tag on table row press
   * based on the performanceType
   */
  let type: NewSearchTag = {};
  switch (performanceType) {
    case PerformanceTableType.STATE:
      type = {
        locationType: LocationTagType.STATE,
      };
      break;
    case PerformanceTableType.CITY:
      type = { locationType: LocationTagType.CITY };
      break;
    case PerformanceTableType.ADDRESS:
      type = {
        locationType: LocationTagType.ADDRESS,
      };
      break;
    case PerformanceTableType.CATEGORY:
      type = {
        businessType: BusinessTagType.CATEGORY,
      };
      break;
    case PerformanceTableType.BRAND:
      type = {
        businessType: BusinessTagType.BUSINESS,
      };
      break;
  }
  return type;
}
