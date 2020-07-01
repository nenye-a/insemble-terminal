import { objectType } from 'nexus';

export let CoverageBusiness = objectType({
  name: 'CoverageBusiness',
  definition(t) {
    t.string('businessName', { nullable: true });
    t.string('numLocations', { nullable: true });
    t.field('locations', {
      type: 'CoverageLocation',
      list: true,
    });
  },
});
