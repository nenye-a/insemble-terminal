import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { BusinessData } from 'dataTypes';

export let CoverageData = objectType({
  name: 'CoverageData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.model.numLocations();
    t.field('coverageData', {
      type: 'CoverageBusiness',
      resolve: async ({ id }) => {
        let coverageData = await prisma.coverageData.findOne({
          where: { id },
        });
        let parseBusinessData: Array<BusinessData> = JSON.parse(
          coverageData?.coverageData || '[]',
        );
        return parseBusinessData;
      },
      list: true,
    });
  },
});
