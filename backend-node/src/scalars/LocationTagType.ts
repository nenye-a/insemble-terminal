import { enumType } from 'nexus';

export let LocationTagType = enumType({
  name: 'LocationTagType',
  members: ['ADDRESS', 'CITY', 'COUNTY', 'STATE', 'NATION'],
});
