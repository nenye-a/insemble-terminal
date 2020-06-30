import {
  ReviewTag,
  PerformanceTableType,
  BusinessType,
  LocationTagType,
} from '../generated/globalTypes';
import { Search_search as Search } from '../generated/Search';
import { ResultQuery, OwnershipType } from '../types/types';

export default function getResultQueries(
  search: Omit<Search, '__typename'>,
): Array<ResultQuery> {
  let { reviewTag, businessTag, locationTag } = search;
  // TODO: change to enum when be ready
  let queries = [];

  if (!reviewTag || reviewTag === ReviewTag.NEWS) {
    queries.push({ reviewTag: ReviewTag.NEWS, type: 'NEWS' });
  }
  if (!reviewTag || reviewTag === ReviewTag.PERFORMANCE) {
    if (businessTag) {
      queries.push({
        reviewTag: ReviewTag.PERFORMANCE,
        type: PerformanceTableType.OVERALL,
      });
    }
    if (!businessTag || businessTag?.type === BusinessType.CATEGORY) {
      queries.push({
        reviewTag: ReviewTag.PERFORMANCE,
        type: PerformanceTableType.BRAND,
      });
    }
    if (!businessTag) {
      queries.push({
        reviewTag: ReviewTag.PERFORMANCE,
        type: PerformanceTableType.CATEGORY,
      });
    }
    if (businessTag) {
      if (!locationTag || locationTag.type === LocationTagType.NATION) {
        queries.push({
          reviewTag: ReviewTag.PERFORMANCE,
          type: PerformanceTableType.CITY,
        });
      } else if (locationTag.type === LocationTagType.STATE) {
        queries.push({
          reviewTag: ReviewTag.PERFORMANCE,
          type: PerformanceTableType.CITY,
        });
      } else if (locationTag.type === LocationTagType.COUNTY) {
        queries.push({
          reviewTag: ReviewTag.PERFORMANCE,
          type: PerformanceTableType.CITY,
        });
      } else if (locationTag.type === LocationTagType.CITY) {
        queries.push({
          reviewTag: ReviewTag.PERFORMANCE,
          type: PerformanceTableType.ADDRESS,
        });
      } else if (locationTag.type === LocationTagType.ADDRESS) {
        // Do nothing, no need to at any address table.
      } else {
        queries.push({
          reviewTag: ReviewTag.PERFORMANCE,
          type: PerformanceTableType.ADDRESS,
        });
      }
    }

    // TODO: there will be by city, by county
  }

  if (!reviewTag || reviewTag === ReviewTag.COVERAGE) {
    if (
      (businessTag?.type === BusinessType.BUSINESS &&
        locationTag?.type !== LocationTagType.NATION) ||
      (businessTag?.type === BusinessType.CATEGORY &&
        locationTag?.type !== LocationTagType.NATION)
    ) {
      queries.push({ reviewTag: ReviewTag.COVERAGE, type: 'COVERAGE' });
    }
  }
  if (!reviewTag || reviewTag === ReviewTag.ACTIVITY) {
    queries.push({ reviewTag: ReviewTag.ACTIVITY, type: 'ACTIVITY' });
  }
  if (!reviewTag || reviewTag === ReviewTag.CONTACT) {
    if (businessTag?.type === BusinessType.BUSINESS) {
      queries.push({
        reviewTag: ReviewTag.CONTACT,
        type: OwnershipType.COMPANY_CONTACT,
      });
    }
    if (
      (!businessTag || businessTag.type === BusinessType.BUSINESS) &&
      locationTag?.type === LocationTagType.ADDRESS
    ) {
      // queries.push({
      //   reviewTag: ReviewTag.CONTACT,
      //   type: OwnershipType.PROPERTY_CONTACT,
      // });
    }
    if (businessTag?.type === BusinessType.BUSINESS) {
      queries.push({
        reviewTag: ReviewTag.CONTACT,
        type: OwnershipType.COMPANY_INFORMATION,
      });
    }
    if (
      (!businessTag || businessTag.type === BusinessType.BUSINESS) &&
      locationTag?.type === LocationTagType.ADDRESS
    ) {
      // queries.push({
      //   reviewTag: ReviewTag.CONTACT,
      //   type: OwnershipType.PROPERTY_INFORMATION,
      // });
    }
  }

  return queries;
}
