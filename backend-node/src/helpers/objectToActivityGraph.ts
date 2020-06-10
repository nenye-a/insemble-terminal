import { acrivityTime } from '../constants/activity';

export let objectToActivityGraph = (
  object: Record<string, number | undefined>,
  businessName: string,
  location?: string,
) => {
  let objectKeyValue = acrivityTime.map((key) => {
    let amount = object[key] ? object[key] : null;
    let business = location ? `${businessName} (${location})` : businessName;
    return {
      name: key,
      business,
      amount,
    };
  });
  return objectKeyValue;
};
