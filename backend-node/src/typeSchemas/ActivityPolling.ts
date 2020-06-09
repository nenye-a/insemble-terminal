import { objectType } from 'nexus';

export let ActivityPolling = objectType({
  name: 'ActivityPolling',
  definition(t) {
    t.boolean('polling');
    t.string('error', { nullable: true });
    t.field('table', {
      type: 'Activity',
      nullable: true,
    });
  },
});
