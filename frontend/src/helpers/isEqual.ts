// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEqual<T, U>(a: any, b: any): boolean {
  // Use this (instead of '===') to compare if 2 objects are equal
  if (a == null && b == null) {
    return true;
  } else if (a == null || b == null) {
    return false;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return isArrayEqual(a, b);
  } else if (typeof a === 'object' && typeof b === 'object') {
    return isObjectEqual(a, b);
  } else {
    return a === b;
  }
}

export function isObjectEqual(a: ObjectKey, b: ObjectKey): boolean {
  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => isEqual(a[key], b[key]));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArrayEqual(a: Array<any>, b: Array<any>): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((_el, i) => isEqual(a[i], b[i]));
}
