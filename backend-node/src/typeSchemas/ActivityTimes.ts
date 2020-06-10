import { objectType } from 'nexus';

export let ActivityTimes = objectType({
  name: 'ActivityTimes',
  definition(t) {
    t.string('name');
    t.string('business');
    t.int('amount', { nullable: true });
  },
});
