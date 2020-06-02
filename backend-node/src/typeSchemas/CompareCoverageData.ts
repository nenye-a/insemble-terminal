import { objectType } from 'nexus';

export let CompareCoverageData = objectType({
  name: 'CompareCoverageData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.numLocations();
    t.model.coverageData();
  },
});
