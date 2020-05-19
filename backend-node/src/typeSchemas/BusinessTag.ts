import { objectType } from 'nexus';

export let BusinessTag = objectType({
  name: 'BusinessTag',
  definition(t) {
    t.model.id();
    t.model.params();
    t.model.type();
  },
});
