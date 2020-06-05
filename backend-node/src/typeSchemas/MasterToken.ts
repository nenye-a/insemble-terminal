import { objectType } from 'nexus';

export let MasterToken = objectType({
  name: 'MasterToken',
  definition(t) {
    t.string('masterToken');
    t.string('name');
    t.int('numToken');
  },
});
