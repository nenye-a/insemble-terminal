import { objectType } from 'nexus';
import { ActivityGraphData } from 'dataTypes';
import { prisma } from '../prisma';

export let ActivityData = objectType({
  name: 'ActivityData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.field('activityData', {
      type: 'ActivityTimes',
      resolve: async ({ id }) => {
        let activityData = await prisma.activityData.findOne({
          where: { id },
        });
        let parseActivityData: Array<ActivityGraphData> = JSON.parse(
          activityData?.activityData || '[]',
        );
        return parseActivityData;
      },
      list: true,
    });
  },
});
