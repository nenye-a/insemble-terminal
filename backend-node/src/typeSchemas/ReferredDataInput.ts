import { inputObjectType } from 'nexus';

export let ReferredDataInput = inputObjectType({
  name: 'ReferredDataInput',
  definition(t) {
    t.string('email', { required: true });
    t.string('firstName', { required: true });
    t.string('lastName', { required: true });
    t.string('company', { required: true });
  },
});
