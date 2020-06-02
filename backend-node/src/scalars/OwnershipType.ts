import { enumType } from 'nexus';

export let OwnershipType = enumType({
  name: 'OwnershipType',
  members: ['PROPERTY', 'COMPANY'],
});
