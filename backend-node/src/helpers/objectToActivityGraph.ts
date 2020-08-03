import { activityTime } from '../constants/activity';

export let objectToActivityGraph = (
  object: Record<string, number | undefined>,
  businessName: string,
  location?: string,
) => {
  /**
   * This function convert the object key data into array of data with name:key.
   * This used mainly on Activity Graph
   * example input:
   * {"2pm":2,"3pm":10},"Starbucks","Atlanta, GA"
   * output:
   * [{name:"2pm",business:"Starbucks (Atlanta, GA)", amount:2},
   * {name:"3pm",business:"Starbucks (Atlanta, GA)", amount:10}]
   */
  let objectKeyValue = activityTime.map((key) => {
    let amount = object[key] ? object[key] : 0;
    let business = location ? `${businessName} (${location})` : businessName;
    return {
      name: key,
      business,
      amount,
    };
  });
  return objectKeyValue;
};
