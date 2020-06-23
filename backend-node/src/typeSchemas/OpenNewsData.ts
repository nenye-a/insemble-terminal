import { objectType } from 'nexus';

export let OpenNewsData = objectType({
  name: 'OpenNewsData',
  definition(t) {
    t.string('title');
    t.string('description');
    t.string('link');
    t.string('source');
    t.string('published');
    t.float('relevance');
  },
});
