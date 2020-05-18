import { objectType } from 'nexus';

export let UserRegisterVerification = objectType({
  name: 'UserRegisterVerification',
  definition(t) {
    t.model.id();
    t.model.verified();
    t.field('auth', {
      type: 'Auth',
      nullable: true,
    });
  },
});
