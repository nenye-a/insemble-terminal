import { enumType } from 'nexus';

export let CompareActionType = enumType({
  name: 'CompareActionType',
  members: ['DELETE_ALL', 'DELETE', 'ADD'],
});
