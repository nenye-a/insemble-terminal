import { objectType } from 'nexus';

export let Terminal = objectType({
  name: 'Terminal',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.model.pinnedFeeds();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
