import { objectType } from 'nexus';

export let CoverageData = objectType({
  name: 'CoverageData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.numLocations();
    t.model.coverageData();
  },
});
