import { objectType } from 'nexus';

import { prisma } from '../prisma';

export let Terminal = objectType({
  name: 'Terminal',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.field('pinnedFeeds', {
      type: 'PinnedFeed',
      resolve: async ({ id }) => {
        let pinnedFeeds = await prisma.pinnedFeed.findMany({
          where: { terminal: { id } },
          orderBy: { id: 'asc' },
        });
        return pinnedFeeds;
      },
      list: true,
    });
    t.model.createdAt();
    t.model.updatedAt();
  },
});
