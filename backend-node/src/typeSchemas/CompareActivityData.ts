import { objectType } from 'nexus';

export let CompareActivityData = objectType({
  name: 'CompareActivityData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.activityData();
  },
});
