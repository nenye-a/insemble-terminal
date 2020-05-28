import { objectType } from 'nexus';

export let ComparationTag = objectType({
  name: 'ComparationTag',
  definition(t) {
    t.model.id();
    t.model.businessTag();
    t.model.locationTag();
  },
});
