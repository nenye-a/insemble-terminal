import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyPerformanceResponse } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';

let performanceTableResolver: FieldResolver<
  'Query',
  'performanceTable'
> = async (
  _: Root,
  { performanceType, businessTagId, locationTagId },
  context: Context,
) => {
  let businessTag = businessTagId
    ? await context.prisma.businessTag.findOne({
        where: {
          id: businessTagId,
        },
      })
    : undefined;
  let locationTag = locationTagId
    ? await context.prisma.locationTag.findOne({
        where: {
          id: locationTagId,
        },
      })
    : undefined;
  let performance = await context.prisma.performance.findMany({
    where: {
      type: performanceType,
      businessTag: businessTag ? { id: businessTag.id } : undefined,
      locationTag: locationTag ? { id: locationTag.id } : undefined,
    },
    include: {
      data: true,
    },
  });

  let selectedPerformanceTable;
  if (performance.length) {
    selectedPerformanceTable = performance[0];
    let updateData = timeCheck(selectedPerformanceTable.updatedAt);
    if (updateData) {
      try {
        let performanceUpdate: PyPerformanceResponse = (
          await axios.get(`${API_URI}/api/performance`, {
            params: {
              dataType: performanceType,
              location: locationTag
                ? { locationType: locationTag.type, params: locationTag.params }
                : undefined,
              business: businessTag
                ? { businessType: businessTag.type, params: businessTag.params }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          })
        ).data;
        let performanceData = performanceUpdate.data.map(
          ({ name, avgRating, avgReviews, numLocations, salesVolumeIndex }) => {
            return {
              name,
              avgRating: avgRating ? `${avgRating}` : '0',
              totalSales: salesVolumeIndex ? `${salesVolumeIndex}` : '0',
              numLocation: numLocations,
              numReview: avgReviews || 0,
            };
          },
        );
        await context.prisma.performanceData.deleteMany({
          where: {
            performance: {
              id: selectedPerformanceTable.id,
            },
          },
        });
        selectedPerformanceTable = await context.prisma.performance.update({
          where: { id: selectedPerformanceTable.id },
          data: {
            data: { create: performanceData },
            updatedAt: new Date(),
          },
        });
      } catch {
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      let performanceUpdate: PyPerformanceResponse = (
        await axios.get(`${API_URI}/api/performance`, {
          params: {
            dataType: performanceType,
            location: locationTag
              ? { locationType: locationTag.type, params: locationTag.params }
              : undefined,
            business: businessTag
              ? { businessType: businessTag.type, params: businessTag.params }
              : undefined,
          },
          paramsSerializer: axiosParamsSerializer,
        })
      ).data;
      let performanceData = performanceUpdate.data.map(
        ({ name, avgRating, avgReviews, numLocations, salesVolumeIndex }) => {
          return {
            name,
            avgRating: avgRating ? `${avgRating}` : '0',
            totalSales: salesVolumeIndex ? `${salesVolumeIndex}` : '0',
            numLocation: numLocations,
            numReview: avgReviews || 0,
          };
        },
      );
      selectedPerformanceTable = await context.prisma.performance.create({
        data: {
          data: { create: performanceData },
          type: performanceType,
          businessTag: businessTag
            ? { connect: { id: businessTag.id } }
            : undefined,
          locationTag: locationTag
            ? { connect: { id: locationTag.id } }
            : undefined,
        },
      });
    } catch (e) {
      throw new Error('Fail to create data.');
    }
  }

  return selectedPerformanceTable;
};

let performanceTable = queryField('performanceTable', {
  type: 'Performance',
  args: {
    performanceType: arg({ type: 'PerformanceTableType', required: true }),
    businessTagId: stringArg(),
    locationTagId: stringArg(),
  },
  resolve: performanceTableResolver,
});

export { performanceTable };
