import { objectType } from 'nexus';

export let Coverage = objectType({
  name: 'Coverage',
  definition(t) {
    t.model.id();
    t.model.businessTag();
    t.model.locationTag();
    t.model.data();
    t.model.comparationTags();
    t.model.compareData();
  },
});
