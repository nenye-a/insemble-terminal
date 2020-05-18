import { objectType } from 'nexus';

export let UserRegisterResult = objectType({
  name: 'UserRegisterResult',
  definition(t) {
    t.string('message');
    t.string('verificationId');
  },
});
