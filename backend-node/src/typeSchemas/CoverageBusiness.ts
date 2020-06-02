import { objectType } from 'nexus';

export let CoverageBusiness = objectType({
  name: 'CoverageBusiness',
  definition(t) {
    t.model.id();
    t.model.businessName();
    t.model.numLocations();
    t.model.locations();
  },
});
