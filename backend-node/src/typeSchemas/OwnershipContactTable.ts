import { objectType } from 'nexus';

export let OwnershipContact = objectType({
  name: 'OwnershipContact',
  definition(t) {
    t.model.id();
    t.model.type();
    t.model.businessTag();
    t.model.locationTag();
    t.model.data();
  },
});
