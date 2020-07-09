import { enumType } from 'nexus';

export let DemoType = enumType({
  name: 'DemoType',
  members: ['BASIC', 'WITH_COMPARE'],
});
