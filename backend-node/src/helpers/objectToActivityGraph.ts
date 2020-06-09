import { activityGraphSort } from '../constants/activity';

export let objectToActivityGraph = (
  object: Record<string, number | undefined>,
  businessName: string,
  location?: string,
) => {
  let objectKeyValue = Object.keys(object)
    .sort((keyA, keyB) => {
      let positionKeyA = activityGraphSort.find(({ name }) => name === keyA);
      let positionKeyB = activityGraphSort.find(({ name }) => name === keyB);
      if (!positionKeyA || !positionKeyB) {
        return 0;
      }
      return positionKeyA.value - positionKeyB.value;
    })
    .map((key) => {
      let amount = object[key];
      let business = location ? `${businessName} (${location})` : businessName;
      return {
        name: key,
        business,
        amount,
      };
    });
  return objectKeyValue;
};
