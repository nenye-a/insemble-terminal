import { ActivityGraphData } from 'dataTypes';

export let activityGraphToObject = (arrayGraph: Array<ActivityGraphData>) => {
  /**
   * This function convert array of data with name:key into the object key data.
   * This used mainly on Activity Graph
   * example input:
   * [{name:"2pm",business:"Starbucks (Atlanta, GA)", amount:2},
   * {name:"3pm",business:"Starbucks (Atlanta, GA)", amount:10}]
   * output:
   * {"2pm":2,"3pm":10}"
   */
  let object: any = {};
  for (let element of arrayGraph) {
    object[element.name] = element.amount;
  }
  return object;
};
