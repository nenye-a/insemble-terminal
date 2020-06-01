import { objectType } from 'nexus';

export let ActivityData = objectType({
  name: 'ActivityData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.activityData();
  },
});
