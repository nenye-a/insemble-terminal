import { enumType } from 'nexus';

export let ReviewTag = enumType({
  name: 'ReviewTag',
  members: ['PERFORMANCE', 'NEWS', 'ACTVITIY', 'OWNERSHIP', 'COVERAGE'],
});
