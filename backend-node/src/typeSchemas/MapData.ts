import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { BusinessData } from 'dataTypes';

export let MapData = objectType({
  name: 'MapData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.numLocations();
    t.field('coverageData', {
      type: 'CoverageBusiness',
      resolve: async ({ id }) => {
        let mapData = await prisma.mapData.findOne({
          where: { id },
        });
        let parseBusinessData: Array<BusinessData> = JSON.parse(
          mapData?.coverageData || '[]',
        );
        return parseBusinessData;
      },
      list: true,
    });
  },
});
