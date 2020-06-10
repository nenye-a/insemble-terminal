import { objectType } from 'nexus';

export let ComparePerformanceData = objectType({
  name: 'ComparePerformanceData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.avgRating();
    t.model.numLocation();
    t.model.numReview();
    t.model.customerVolumeIndex();
    t.model.localCategoryIndex();
    t.model.localRetailIndex();
    t.model.nationalIndex();
    t.model.compareId();
  },
});
