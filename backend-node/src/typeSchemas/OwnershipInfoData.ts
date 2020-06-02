import { objectType } from 'nexus';

export let OwnershipInfoData = objectType({
  name: 'OwnershipInfoData',
  definition(t) {
    t.model.id();
    t.model.parentCompany();
    t.model.headquarters();
    t.model.phone();
    t.model.website();
    t.model.lastUpdate();
  },
});
