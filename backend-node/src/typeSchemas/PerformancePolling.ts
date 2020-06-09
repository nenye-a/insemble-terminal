import { objectType } from 'nexus';

export let PerformancePolling = objectType({
  name: 'PerformancePolling',
  definition(t) {
    t.boolean('polling');
    t.string('error', { nullable: true });
    t.field('table', {
      type: 'Performance',
      nullable: true,
    });
  },
});
