import {
  ReviewTag,
  LocationTagInput,
  LocationTagType,
  BusinessType,
} from '../generated/globalTypes';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';

export default function isSearchCombinationValid(
  reviewTag: string,
  businessTag: BusinessTag | string | null,
  locationTag: LocationTagInput | null,
) {
  let formattedReviewTag = reviewTag.toUpperCase();
  let hasReviewTag = !!reviewTag;
  let hasBusinessTag =
    typeof businessTag === 'string' ? !!businessTag : !!businessTag?.params;
  let hasLocationTag = !!locationTag?.params;
  if (formattedReviewTag === ReviewTag.PERFORMANCE) {
    // all case is valid
    return true;
  } else if (formattedReviewTag === ReviewTag.NEWS) {
    // all case is valid
    return true;
  } else if (formattedReviewTag === ReviewTag.OWNERSHIP) {
    if (locationTag?.type === LocationTagType.ADDRESS) {
      return true;
    } else if (
      typeof businessTag === 'string' ||
      businessTag?.type === BusinessType.BUSINESS
    ) {
      return true;
    }
  } else if (formattedReviewTag === ReviewTag.COVERAGE) {
    if (
      hasBusinessTag &&
      (typeof businessTag === 'string' ||
        businessTag?.type === BusinessType.BUSINESS) &&
      (!hasLocationTag ||
        (hasLocationTag &&
          locationTag?.type !== LocationTagType.ADDRESS &&
          locationTag?.type !== LocationTagType.NATION))
    ) {
      return true;
    }
  } else if (formattedReviewTag === ReviewTag.ACTIVITY) {
    if (
      typeof businessTag === 'string' ||
      businessTag?.type === BusinessType.BUSINESS
    ) {
      return true;
    }
  } else if (!hasReviewTag) {
    if (
      (((typeof businessTag !== 'string' &&
        businessTag?.type === BusinessType.BUSINESS) ||
        (hasBusinessTag && typeof businessTag === 'string')) &&
        !hasLocationTag) ||
      (!hasBusinessTag && hasLocationTag)
    ) {
      return true;
    }
  }
  return false;
}
