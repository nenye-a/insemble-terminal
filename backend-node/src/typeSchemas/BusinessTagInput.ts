import { inputObjectType } from 'nexus';

export let BusinessTagInput = inputObjectType({
  name: 'BusinessTagInput',
  definition(t) {
    t.field('type', { type: 'BusinessTagType', required: true });
    t.string('params', { required: true });
  },
});
