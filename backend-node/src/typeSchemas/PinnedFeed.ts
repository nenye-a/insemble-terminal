import { objectType } from 'nexus';

export let PinnedFeed = objectType({
  name: 'PinnedFeed',
  definition(t) {
    t.model.id();
    t.model.tableId();
    t.model.tableType();
  },
});
