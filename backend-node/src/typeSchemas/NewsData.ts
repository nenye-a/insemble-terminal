import { objectType } from 'nexus';

export let NewsData = objectType({
  name: 'NewsData',
  definition(t) {
    t.model.id();
    t.model.title();
    t.model.description();
    t.model.link();
    t.model.source();
    t.model.published();
    t.model.relevance();
  },
});
