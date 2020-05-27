import { objectType } from 'nexus';

export let ComparisonMutation = objectType({
  name: 'ComparisonMutation',
  definition(t) {
    t.field('comparationTags', { type: 'ComparationTag', list: true });
    t.field('reviewTag', { type: 'ReviewTag' });
    t.string('tableId');
  },
});
