import { objectType } from 'nexus';

export let OwnershipContactData = objectType({
  name: 'OwnershipContactData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.title();
    t.model.phone();
    t.model.email();
  },
});
