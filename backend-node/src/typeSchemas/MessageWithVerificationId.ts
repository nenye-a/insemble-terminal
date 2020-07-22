import { objectType } from 'nexus';

export let MessageWithVerificationId = objectType({
  name: 'MessageWithVerificationId',
  definition(t) {
    t.string('message');
    t.string('verificationId');
  },
});
