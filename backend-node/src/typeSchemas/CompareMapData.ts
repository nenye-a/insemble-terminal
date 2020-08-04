import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { BusinessData } from 'dataTypes';

export let CompareMapData = objectType({
  name: 'CompareMapData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.numLocations();
    t.field('coverageData', {
      type: 'CoverageBusiness',
      resolve: async ({ id }) => {
        /**
         * This resolve the coverageData JSON string into array of Object BusinessData.
         */
        let mapData = await prisma.compareMapData.findOne({
          where: { id },
        });
        let parseBusinessData: Array<BusinessData> = JSON.parse(
          mapData?.coverageData || '[]',
        );
        return parseBusinessData;
      },
      list: true,
    });
    t.model.compareId();
  },
});
