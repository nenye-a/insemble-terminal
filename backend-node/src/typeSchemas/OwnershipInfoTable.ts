import { objectType } from 'nexus';

export let OwnershipInfo = objectType({
  name: 'OwnershipInfo',
  definition(t) {
    t.model.id();
    t.model.type();
    t.model.businessTag();
    t.model.locationTag();
    t.model.data();
  },
});
