import { inputObjectType } from 'nexus';

export let LocationTagInput = inputObjectType({
  name: 'LocationTagInput',
  definition(t) {
    t.field('type', { type: 'LocationTagType', required: true });
    t.string('params', { required: true });
  },
});
