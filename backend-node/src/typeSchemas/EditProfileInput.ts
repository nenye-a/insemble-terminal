import { inputObjectType } from 'nexus';

export let EditProfileInput = inputObjectType({
  name: 'EditProfileInput',
  definition(t) {
    t.string('email');
    t.string('firstName');
    t.string('lastName');
    t.string('company');
    t.string('title');
    t.string('address');
    t.string('description');
    t.string('oldPassword');
    t.string('newPassword');
  },
});
