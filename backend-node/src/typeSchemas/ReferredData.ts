import { objectType } from 'nexus';

export let ReferredData = objectType({
  name: 'ReferredData',
  definition(t) {
    t.string('email');
    t.string('firstName');
    t.string('lastName');
    t.string('company');
  },
});
