import { enumType } from 'nexus';

export let PerformanceTableType = enumType({
  name: 'PerformanceTableType',
  members: ['BRAND', 'CATEGORY', 'OVERALL', 'ADDRESS', 'CITY', 'STATE'],
});
