import { objectType } from 'nexus';

export let NewsPolling = objectType({
  name: 'NewsPolling',
  definition(t) {
    t.boolean('polling');
    t.string('error', { nullable: true });
    t.field('table', {
      type: 'News',
      nullable: true,
    });
  },
});
