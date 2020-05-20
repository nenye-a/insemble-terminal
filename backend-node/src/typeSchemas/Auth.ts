import { objectType } from 'nexus';

export let Auth = objectType({
  name: 'Auth',
  definition(t) {
    t.string('token');
    t.field('user', {
      type: 'User',
    });
  },
});
