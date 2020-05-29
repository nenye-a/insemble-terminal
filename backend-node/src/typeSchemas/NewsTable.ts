import { objectType } from 'nexus';

export let News = objectType({
  name: 'News',
  definition(t) {
    t.model.id();
    t.model.businessTag();
    t.model.locationTag();
    t.model.data();
    t.model.comparationTags();
    t.model.compareData();
  },
});
