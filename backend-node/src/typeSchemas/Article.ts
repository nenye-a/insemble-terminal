import { objectType } from 'nexus';

export let Article = objectType({
  name: 'Article',
  definition(t) {
    t.string('title');
    t.string('source');
    t.field('published', { type: 'DateTime' });
    t.string('link');
  },
});
