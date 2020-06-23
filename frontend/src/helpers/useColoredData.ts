import { COLORS } from '../constants/colors';
import { ComparationTag, HasCompareId } from '../types/types';

import generateRandomColor from './generateRandomColor';

export default function useColoredData<T, U>(
  data: Array<T> = [],
  compareData: Array<U & HasCompareId> = [],
  comparationTags: Array<ComparationTag> = [],
  sortOrder: Array<string>,
  skipFirstColor = false,
) {
  let comparationTagsWithFill = comparationTags
    .sort((a, b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id))
    .map((item, idx) => {
      let usableColors = skipFirstColor ? COLORS.slice(1) : COLORS;
      let fill =
        idx <= usableColors.length - 1
          ? usableColors[idx]
          : generateRandomColor();
      return { ...item, fill };
    });

  let filteredDataWithFoundTag: Array<
    U & {
      isComparison: boolean;
      compareId: string;
    }
  > = [];
  comparationTagsWithFill.reduce((result, tag) => {
    let foundItems = compareData.filter((item) => tag.id === item.compareId);
    if (foundItems) {
      result.push(
        ...foundItems.map((item) => {
          return {
            ...item,
            isComparison: true,
            fill: tag.fill,
          };
        }),
      );
    }
    return result;
  }, filteredDataWithFoundTag);
  let mergedData = [
    ...data.map((item) => ({ ...item, isComparison: false })),
    ...filteredDataWithFoundTag,
  ];

  return {
    data: mergedData,
    comparisonTags: comparationTagsWithFill,
  };
}
