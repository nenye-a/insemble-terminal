import { objectType } from 'nexus';

export let PerformanceData = objectType({
  name: 'PerformanceData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.avgRating();
    t.model.numLocation();
    t.model.numReview();
    t.model.numNearby();
    t.model.customerVolumeIndex();
    t.model.localCategoryIndex();
    t.model.localRetailIndex();
    t.model.nationalIndex();
  },
});
