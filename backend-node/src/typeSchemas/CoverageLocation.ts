import { objectType } from 'nexus';

export let CoverageLocation = objectType({
  name: 'CoverageLocation',
  definition(t) {
    t.model.id();
    t.model.lat();
    t.model.lng();
    t.model.name();
    t.model.address();
    t.model.numReviews();
  },
});
