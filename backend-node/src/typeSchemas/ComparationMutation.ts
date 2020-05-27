import { objectType } from 'nexus';

export let ComparationMutation = objectType({
  name: 'ComparationMutation',
  definition(t) {
    t.field('comparationTags', { type: 'ComparationTag', list: true });
    t.field('reviewTag', { type: 'ReviewTag' });
    t.string('tableId');
  },
});
