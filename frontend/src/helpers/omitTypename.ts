export default function omitTypename<T extends ObjectKey>(data: Array<T> | T) {
  let omitTypenameFromObject = (obj: T) => {
    if (obj.hasOwnProperty('__typename')) {
      let { __typename, ...otherEntries } = obj;
      return { ...otherEntries };
    }
    return obj;
  };
  if (Array.isArray(data)) {
    return data.map((item) => {
      return omitTypenameFromObject(item);
    });
  }

  return omitTypenameFromObject(data);
}
