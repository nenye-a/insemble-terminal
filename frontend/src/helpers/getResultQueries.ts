import {
  ReviewTag,
  PerformanceTableType,
  BusinessType,
  LocationTagType,
} from '../generated/globalTypes';
import { Search_search as Search } from '../generated/Search';
import { ResultQuery } from '../types/types';

export default function getResultQueries(
  search: Omit<Search, '__typename'>,
): Array<ResultQuery> {
  let { reviewTag, businessTag, locationTag } = search;
  // TODO: change to enum when be ready
  let queries = [];
  if (reviewTag === ReviewTag.PERFORMANCE) {
    if (businessTag) {
      queries.push({
        reviewTag,
        type: PerformanceTableType.OVERALL,
      });
    }
    if (!businessTag || businessTag?.type === BusinessType.CATEGORY) {
      queries.push({
        reviewTag,
        type: PerformanceTableType.BRAND,
      });
    }
    if (!businessTag) {
      queries.push({
        reviewTag,
        type: PerformanceTableType.CATEGORY,
      });
    }
    if (
      businessTag &&
      (!locationTag || locationTag?.type === LocationTagType.NATION)
    ) {

      if(!location || locationTag?.type === LocationTagType.NATION) {

        queries.push({
          reviewTag,
          type: PerformanceTableType.STATE,
        });
      }
    }
    if (
      businessTag &&
      locationTag &&
      locationTag.type !== LocationTagType.NATION
    ) {
      queries.push({
        reviewTag,
        type: PerformanceTableType.ADDRESS,
      });
    }
    // TODO: there will be by city, by county
  }
  if (reviewTag === ReviewTag.NEWS) {
    queries.push({ reviewTag, type: 'NEWS' });
  }
  if (reviewTag === ReviewTag.OWNERSHIP) {
    if (businessTag?.type === BusinessType.BUSINESS) {
      queries.push({ reviewTag, type: 'COMPANY_INFORMATION' });
    }
    if (businessTag?.type === BusinessType.BUSINESS) {
      queries.push({ reviewTag, type: 'COMPANY_CONTACT' });
    }
    if (
      (!businessTag || businessTag.type === BusinessType.BUSINESS) &&
      locationTag?.type === LocationTagType.ADDRESS
    ) {
      queries.push({ reviewTag, type: 'PROPERTY_CONTACT' });
    }
    if (
      (!businessTag || businessTag.type === BusinessType.BUSINESS) &&
      locationTag?.type === LocationTagType.ADDRESS
    ) {
      queries.push({ reviewTag, type: 'PROPERTY_OWNER_INFORMATION' });
    }
  }
  if (reviewTag === ReviewTag.COVERAGE) {
    if (
      businessTag?.type === BusinessType.BUSINESS &&
      locationTag?.type !== LocationTagType.ADDRESS
    ) {
      queries.push({ reviewTag, type: 'COVERAGE' });
    }
  }
  // Enable this when reviewTag enum has Activity
  // if (reviewTag === 'ACTIVITY') {
  //   if (businessTag?.type === BusinessType.BUSINESS) {
  //     queries.push({ reviewTag, type: 'ACTIVITY' });
  //   }
  // }
  // brand only
  if (!reviewTag && businessTag?.type === BusinessType.BUSINESS) {
    queries.push({ reviewTag, type: 'NEWS' });
    queries.push({
      reviewTag,
      type: PerformanceTableType.OVERALL,
    });
    queries.push({ reviewTag, type: 'COVERAGE' });
    queries.push({ reviewTag, type: 'ACTIVITY' });
    queries.push({ reviewTag, type: 'COMPANY_INFORMATION' });
    queries.push({ reviewTag, type: 'COMPANY_CONTACT' });
  }
  if (!reviewTag && locationTag) {
    queries.push({ reviewTag, type: 'NEWS' });
    queries.push({
      reviewTag,
      type: PerformanceTableType.BRAND,
    });
    queries.push({
      reviewTag,
      type: PerformanceTableType.CATEGORY,
    });
  }
  return queries;
}
