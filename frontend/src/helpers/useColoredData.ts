import { COLORS } from '../constants/colors';
import { ComparationTag } from '../types/types';
import {
  GetPerformanceTable_performanceTable_data as PerformanceData,
  GetPerformanceTable_performanceTable_compareData as PerformanceCompareData,
} from '../generated/GetPerformanceTable';
import {
  GetNewsTable_newsTable_data as NewsData,
  GetNewsTable_newsTable_compareData as NewsCompareData,
} from '../generated/GetNewsTable';
import {
  GetActivity_activityTable_data as ActivityData,
  GetActivity_activityTable_compareData as ActivityCompareData,
} from '../generated/GetActivity';
import {
  GetCoverage_coverageTable_data as CoverageData,
  GetCoverage_coverageTable_compareData as CoverageCompareData,
} from '../generated/GetCoverage';

import generateRandomColor from './generateRandomColor';

export default function useColoredData<T, U, V>(
  data: Array<PerformanceData | NewsData | ActivityData | CoverageData> = [],
  compareData: Array<
    | PerformanceCompareData
    | NewsCompareData
    | ActivityCompareData
    | CoverageCompareData
  > = [],
  comparationTags: Array<ComparationTag> = [],
) {
  let comparationTagsWithFill = comparationTags.map((item, idx) => {
    let fill = idx <= COLORS.length - 1 ? COLORS[idx] : generateRandomColor();
    return { ...item, fill };
  });

  let mergedData = [
    ...data.map((item) => ({ ...item, isComparison: false })),
    ...compareData.map((item) => {
      // change to compareId
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
