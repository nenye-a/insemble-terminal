import { enumType } from 'nexus';

export let TableType = enumType({
  name: 'TableType',
  members: [
    'PERFORMANCE',
    'NEWS',
    'ACTIVITY',
    'OWNERSHIP_INFO',
    'OWNERSHIP_CONTACT',
    'COVERAGE',
    'NOTE',
  ],
});
