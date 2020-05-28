import { enumType } from 'nexus';

export let CompareActionType = enumType({
  name: 'CompareActionType',
  members: ['DELETE', 'ADD'],
});
