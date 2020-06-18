import { objectType } from 'nexus';

export let Search = objectType({
  name: 'Search',
  definition(t) {
    t.string('searchId');
    t.field('reviewTag', { type: 'ReviewTag', nullable: true });
    t.field('businessTag', { type: 'BusinessTag', nullable: true });
    t.field('locationTag', { type: 'LocationTag', nullable: true });
  },
});
