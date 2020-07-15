import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { ActivityGraphData } from 'dataTypes';

export let CompareActivityData = objectType({
  name: 'CompareActivityData',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.location();
    t.field('activityData', {
      type: 'ActivityTimes',
      resolve: async ({ id }) => {
        /**
         * This resolve the activityData JSON string into array of Object ActivityGraphData.
         */
        let activityData = await prisma.compareActivityData.findOne({
          where: { id },
        });
        let parseActivityData: Array<ActivityGraphData> = JSON.parse(
          activityData?.activityData || '[]',
        );
        return parseActivityData;
      },
      list: true,
    });
    t.model.compareId();
  },
});
