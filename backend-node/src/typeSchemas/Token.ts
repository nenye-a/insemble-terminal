import { objectType } from 'nexus';

export let Token = objectType({
  name: 'Token',
  definition(t) {
    t.string('token');
    t.string('linkedEmail');
  },
});
