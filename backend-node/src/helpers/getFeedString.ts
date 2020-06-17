import capitalize from './capitalize';
import { TableParams } from 'dataTypes';
import { LocationTagType } from '@prisma/client';

export default function getFeedString(tableParams: TableParams) {
  let { tableType, type, businessTag, locationTag } = tableParams;
  let formattedReview = tableType
    ? type
      ? `${capitalize(tableType)} by ${capitalize(type)}`
      : capitalize(tableType)
    : '';
  let formattedBusiness = businessTag
    ? `${businessTag.params}  ${capitalize(businessTag.type)}`
    : '';
  let formattedLocation =
    locationTag?.type === LocationTagType.ADDRESS
      ? `near ${locationTag.params} ${capitalize(locationTag?.type)}`
      : locationTag?.type === LocationTagType.CITY ||
        locationTag?.type === LocationTagType.COUNTY ||
        locationTag?.type === LocationTagType.STATE
      ? `in ${locationTag?.params} ${capitalize(locationTag?.type)}`
      : '';
  let formattedText = `${formattedBusiness} ${formattedReview} ${formattedLocation}`.trim();
  return formattedText;
}
