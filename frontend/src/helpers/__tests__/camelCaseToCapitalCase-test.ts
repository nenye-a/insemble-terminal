import camelCaseToCapitalCase from '../camelCaseToCapitalCase';

describe('camelCaseToCapitalCase', () => {
  it('should return an Array of capital case string', () => {
    let arr = ['camelCase', 'CamelCase'];

    let convertedArr = arr.map((item) => camelCaseToCapitalCase(item));
    expect(convertedArr).toEqual(['Camel Case', 'Camel Case']);
  });
});
