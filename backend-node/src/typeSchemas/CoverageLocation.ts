import { objectType } from 'nexus';

export let CoverageLocation = objectType({
  name: 'CoverageLocation',
  definition(t) {
    t.float('lat');
    t.float('lng');
    t.string('name', { nullable: true });
    t.string('address', { nullable: true });
    t.float('numReviews', { nullable: true });
  },
});
