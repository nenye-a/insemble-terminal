export default function camelCaseToCapitalCase(value: string | number) {
  if (value) {
    let stringValue = value.toString();
    if (stringValue) {
      return stringValue
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
    }
  }
  return '';
}
