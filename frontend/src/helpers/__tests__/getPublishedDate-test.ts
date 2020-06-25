import getPublishedDate from '../getPublishedDate';

describe('getPublishedDate', () => {
  it('should return an Array of formatted published date', () => {
    let arr = ['2020-05-28T11:03:00.000Z', '2020-05-22T11:03:00.000Z'];

    let convertedArr = arr.map((item) => getPublishedDate(item, 1590748938818)); // May-29-2020:5:43
    expect(convertedArr).toEqual(['5/28', '5/22']);
  });
});
