import { objectType } from 'nexus';

export let Note = objectType({
  name: 'Note',
  definition(t) {
    t.model.id();
    t.model.title();
    t.model.content();
  },
});
