import { objectType } from 'nexus';

export let CreateLicense = objectType({
  name: 'CreateLicense',
  definition(t) {
    t.string('masterToken');
    t.string('tokens', { list: true });
  },
});
