import { objectType } from 'nexus';

export let ComparationTag = objectType({
  name: 'ComparationTag',
  definition(t) {
    t.model.id();
    t.model.locationTag();
    t.model.businessTag();
  },
});
