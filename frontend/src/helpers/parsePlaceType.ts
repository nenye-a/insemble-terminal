import { LocationTagType } from '../generated/globalTypes';

export default function parsePlaceType(placeTypes: Array<string>) {
  if (!placeTypes) {
    return LocationTagType.NATION;
  } else if (placeTypes.length > 0) {
    if (placeTypes.includes('administrative_area_level_1')) {
      return LocationTagType.STATE;
    } else if (placeTypes.includes('administrative_area_level_2')) {
      return LocationTagType.COUNTY;
    } else if (
      placeTypes.includes('administrative_area_level_3') ||
      placeTypes.includes('locality') ||
      placeTypes.includes('neighborhood')
    ) {
      return LocationTagType.CITY;
    } else if (
      placeTypes.includes('street_address') ||
      placeTypes.includes('route')
    ) {
      return LocationTagType.ADDRESS;
    }
  }
  return LocationTagType.ADDRESS;
}
