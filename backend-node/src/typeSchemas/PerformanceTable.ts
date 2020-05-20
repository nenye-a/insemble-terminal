import { objectType } from 'nexus';

export let Performance = objectType({
  name: 'Performance',
  definition(t) {
    t.model.id();
    t.model.type();
    t.model.businessTag();
    t.model.locationTag();
    t.model.data();
  },
});
