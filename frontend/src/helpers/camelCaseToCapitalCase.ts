export default function camelCaseToCapitalCase(value: string | number) {
  // Convert camelCase string to Capital Case string
  if (value) {
    let stringValue = value.toString();
    if (stringValue) {
      return stringValue
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }
  }
  return '';
}
