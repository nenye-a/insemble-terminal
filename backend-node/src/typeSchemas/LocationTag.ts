import { objectType } from 'nexus';

export let LocationTag = objectType({
  name: 'LocationTag',
  definition(t) {
    t.model.id();
    t.model.params();
    t.model.type();
  },
});
