export let objectToActivityGraph = (
  object: Record<string, number | undefined>,
  businessName: string,
  location?: string,
) => {
  let objectKeyValue = Object.keys(object).map((key) => {
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
