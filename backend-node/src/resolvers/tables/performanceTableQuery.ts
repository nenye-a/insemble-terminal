import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyPerformanceResponse, PyPerformanceData } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';

let performanceTableResolver: FieldResolver<
  'Query',
  'performanceTable'
> = async (
  _: Root,
  { performanceType, businessTagId, locationTagId, tableId },
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
    include: { license: true },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  if (!user.license && user.role === 'USER') {
    throw new Error('Pelase activate your account.');
  }

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
  let performance;
  if (tableId) {
    let selectedPerformanceById = await context.prisma.performance.findOne({
      where: { id: tableId },
      include: {
        locationTag: true,
        businessTag: true,
        comparationTags: {
          include: {
            locationTag: true,
            businessTag: true,
          },
        },
      },
    });
    if (!selectedPerformanceById) {
      throw new Error('Table not found');
    }
    performance = [selectedPerformanceById];
  } else {
    performance = await context.prisma.performance.findMany({
      where: {
        type: performanceType,
        businessTag: businessTag ? { id: businessTag.id } : null,
        locationTag: locationTag ? { id: locationTag.id } : null,
      },
      include: {
        locationTag: true,
        businessTag: true,
        comparationTags: {
          include: {
            locationTag: true,
            businessTag: true,
          },
        },
      },
    });
    performance = performance.filter(
      ({ comparationTags }) => comparationTags.length === 0,
    );
  }

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
              location: selectedPerformanceTable.locationTag
                ? {
                    locationType: selectedPerformanceTable.locationTag.type,
                    params: selectedPerformanceTable.locationTag.params,
                  }
                : undefined,
              business: selectedPerformanceTable.businessTag
                ? {
                    businessType: selectedPerformanceTable.businessTag.type,
                    params: selectedPerformanceTable.businessTag.params,
                  }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          })
        ).data;
        let performanceData = performanceUpdate.data.map(
          ({ name, avgRating, avgReviews, numLocations, salesVolumeIndex }) => {
            return {
              name: name || '-',
              avgRating: avgRating ? `${avgRating}` : null,
              totalSales: salesVolumeIndex ? `${salesVolumeIndex}` : null,
              numLocation: numLocations,
              numReview: avgReviews,
            };
          },
        );
        let rawCompareData: Array<PyPerformanceData & {
          compareId: string;
        }> = [];
        for (let comparationTag of selectedPerformanceTable.comparationTags) {
          let compareDataUpdate: PyPerformanceResponse = (
            await axios.get(`${API_URI}/api/performance`, {
              params: {
                dataType: performanceType,
                location: comparationTag.locationTag
                  ? {
                      locationType: comparationTag.locationTag.type,
                      params: comparationTag.locationTag.params,
                    }
                  : undefined,
                business: comparationTag.businessTag
                  ? {
                      businessType: comparationTag.businessTag.type,
                      params: comparationTag.businessTag.params,
                    }
                  : undefined,
              },
              paramsSerializer: axiosParamsSerializer,
            })
          ).data;
          rawCompareData = rawCompareData.concat(
            compareDataUpdate.data.map((data) => ({
              ...data,
              compareId: comparationTag.id,
            })),
          );
        }
        let compareData = rawCompareData.map(
          ({
            name,
            avgRating,
            avgReviews,
            numLocations,
            salesVolumeIndex,
            compareId,
          }) => {
            return {
              name: name || '-',
              avgRating: avgRating ? `${avgRating}` : null,
              totalSales: salesVolumeIndex ? `${salesVolumeIndex}` : null,
              numLocation: numLocations,
              numReview: avgReviews,
              compareId,
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
        await context.prisma.comparePerformanceData.deleteMany({
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
            compareData: { create: compareData },
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
            name: name || '-',
            avgRating: avgRating ? `${avgRating}` : null,
            totalSales: salesVolumeIndex ? `${salesVolumeIndex}` : null,
            numLocation: numLocations,
            numReview: avgReviews,
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
    tableId: stringArg(),
  },
  resolve: performanceTableResolver,
});

export { performanceTable };
