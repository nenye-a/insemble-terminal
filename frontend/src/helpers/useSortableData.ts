import { useState, useMemo } from 'react';

import { Direction } from '../types/types';

export type SortConfig = {
  key: string;
  direction: Direction;
  type?: 'number' | 'date';
} | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = { [key: string]: any };

export default function useSortableData<T extends Obj>(
  items: Array<T>,
  config: SortConfig = null,
) {
  let [sortConfig, setSortConfig] = useState(config);

  let sortedData = useMemo(() => {
    let sortableData = [...items];
    if (sortConfig != null) {
      sortableData.sort((a, b) => {
        if (sortConfig) {
          let { key } = sortConfig;
          if (sortConfig.type === 'date') {
            return sortConfig.direction === Direction.ASCENDING
              ? a[key].localeCompare(b[key])
              : -a[key].localeCompare(b[key]);
          } else {
            return sortConfig.direction === Direction.ASCENDING
              ? a[key] - b[key]
              : b[key] - a[key];
          }
        }
        return 0;
      });
    }
    return sortableData;
  }, [items, sortConfig]);

  let requestSort = (
    key: string,
    type: 'number' | 'date' = 'number',
    direction: Direction = Direction.ASCENDING,
  ) => {
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === Direction.ASCENDING
    ) {
      direction = Direction.DESCENDING;
    }
    setSortConfig({ key, direction, type });
  };

  return { sortedData, requestSort, sortConfig };
}
