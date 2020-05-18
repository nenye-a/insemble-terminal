import { objectType } from 'nexus';

export let TenantAuth = objectType({
  name: 'Auth',
  definition(t) {
    t.string('token');
    t.field('user', {
      type: 'User',
    });
  },
});
