import { COLORS } from '../constants/colors';
import { ComparationTag } from '../types/types';

import generateRandomColor from './generateRandomColor';

type HasCompareId = {
  compareId: string;
};

export default function useColoredData<T, U>(
  data: Array<T> = [],
  compareData: Array<U & HasCompareId> = [],
  comparationTags: Array<ComparationTag> = [],
) {
  let comparationTagsWithFill = comparationTags.map((item, idx) => {
    let fill = idx <= COLORS.length - 1 ? COLORS[idx] : generateRandomColor();
    return { ...item, fill };
  });

  let mergedData = [
    ...data.map((item) => ({ ...item, isComparison: false })),
    ...compareData.map((item) => {
      let foundId = comparationTagsWithFill.find(
        (tag) => tag.id === item.compareId,
      );
      if (foundId) {
        return {
          ...item,
          isComparison: true,
          fill: foundId.fill,
        };
      }
      return {
        ...item,
        isComparison: true,
      };
    }),
  ];

  return {
    data: mergedData,
    comparisonTags: comparationTagsWithFill,
  };
}
