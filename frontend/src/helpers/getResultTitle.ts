import { LocationTagType } from '../generated/globalTypes';
import { SearchParams } from '../types/types';

import capitalize from './capitalize';

export default function getResultTitle(searchTag: SearchParams) {
  let { reviewTag, businessTag, locationTag } = searchTag;
  let formattedReview = reviewTag ? capitalize(reviewTag) : '';
  let formattedBusiness = businessTag?.params ? businessTag?.params : '';
  let formattedLocation =
    locationTag?.type === LocationTagType.ADDRESS
      ? `near ${locationTag.params}`
      : locationTag?.type === LocationTagType.CITY ||
        locationTag?.type === LocationTagType.COUNTY ||
        locationTag?.type === LocationTagType.STATE
      ? `in ${locationTag?.params}`
      : '';
  let formattedText = `${formattedBusiness} ${formattedReview} ${formattedLocation}`.trim();
  return formattedText;
}
