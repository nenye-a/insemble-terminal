import omitTypename from '../omitTypename';

describe('omitTypename', () => {
  it('should remove __typename from an object', () => {
    let testObj = {
      __typename: 'User',
      name: 'Name',
      age: 10,
    };

    let cleanObj = omitTypename(testObj);
    expect(cleanObj).toEqual({
      name: 'Name',
      age: 10,
    });
  });

  it('should remove __typename from an array', () => {
    let testObj = [
      {
        __typename: 'User',
        name: 'A',
        age: 1,
      },
      {
        __typename: 'User',
        name: 'B',
        age: 2,
      },
      {
        __typename: 'User',
        name: 'C',
        age: 3,
      },
    ];

    let cleanObj = omitTypename(testObj);
    expect(cleanObj).toEqual([
      {
        name: 'A',
        age: 1,
      },
      {
        name: 'B',
        age: 2,
      },
      {
        name: 'C',
        age: 3,
      },
    ]);
  });
});
