import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { Root, Context } from 'serverTypes';
import { PyPerformanceResponse, PyPerformanceData } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { todayMinOneH } from '../../helpers/todayMinOneH';

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
    let selectedTable = performance[0];
    if (selectedPerformanceTable.error) {
      let table = await context.prisma.performance.update({
        where: {
          id: selectedTable.id,
        },
        data: {
          error: null,
          updatedAt: todayMinOneH(),
        },
      });
      return {
        table,
        error: selectedPerformanceTable.error,
        polling: selectedPerformanceTable.polling,
      };
    }
    let updateData = timeCheck(selectedPerformanceTable.updatedAt);
    if (updateData) {
      if (!selectedPerformanceTable.polling) {
        selectedPerformanceTable = await context.prisma.performance.update({
          where: { id: selectedTable.id },
          data: {
            polling: true,
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
        let mainDataPromise = axios.get(`${API_URI}/api/performance`, {
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
        });
        let compareDataPromises: Array<Promise<AxiosResponse>> = [];
        let compareIds: Array<string> = [];
        for (let comparationTag of selectedPerformanceTable.comparationTags) {
          let compareDataPromise = axios.get(`${API_URI}/api/performance`, {
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
          });
          compareDataPromises.push(compareDataPromise);
          compareIds.push(comparationTag.id);
        }
        Promise.all([mainDataPromise, ...compareDataPromises])
          .then(async (value) => {
            let [mainResponse, ...compareResponses] = value;
            let mainData: PyPerformanceResponse = mainResponse.data;
            let performanceData = mainData.data.map(
              ({
                name,
                avgRating,
                avgReviews,
                numLocations,
                customerVolumeIndex,
                localCategoryIndex,
                localRetailIndex,
                nationalIndex,
              }) => {
                return {
                  name: name || '-',
                  avgRating: avgRating ? `${avgRating}` : null,
                  customerVolumeIndex,
                  localCategoryIndex,
                  localRetailIndex,
                  nationalIndex,
                  numLocation: numLocations,
                  numReview: avgReviews,
                };
              },
            );
            let rawCompareData: Array<PyPerformanceData & {
              compareId: string;
            }> = [];
            for (let [index, compareResponse] of compareResponses.entries()) {
              let compareData: PyPerformanceResponse = compareResponse.data;
              rawCompareData = rawCompareData.concat(
                compareData.data.map((data) => ({
                  ...data,
                  compareId: compareIds[index],
                })),
              );
            }
            let compareData = rawCompareData.map(
              ({
                name,
                avgRating,
                avgReviews,
                numLocations,
                customerVolumeIndex,
                localCategoryIndex,
                localRetailIndex,
                nationalIndex,
                compareId,
              }) => {
                return {
                  name: name || '-',
                  avgRating: avgRating ? `${avgRating}` : null,
                  customerVolumeIndex,
                  localCategoryIndex,
                  localRetailIndex,
                  nationalIndex,
                  numLocation: numLocations,
                  numReview: avgReviews,
                  compareId,
                };
              },
            );
            await context.prisma.performanceData.deleteMany({
              where: {
                performance: {
                  id: selectedTable.id,
                },
              },
            });
            await context.prisma.comparePerformanceData.deleteMany({
              where: {
                performance: {
                  id: selectedTable.id,
                },
              },
            });
            await context.prisma.performance.update({
              where: { id: selectedTable.id },
              data: {
                data: { create: performanceData },
                compareData: { create: compareData },
                polling: false,
                updatedAt: new Date(),
              },
            });
          })
          .catch(async () => {
            await context.prisma.performance.update({
              where: { id: selectedTable.id },
              data: {
                error: 'Failed to update Performance. Please try again.',
                polling: false,
                updatedAt: todayMinOneH(),
              },
            });
          });
      }
    }
  } else {
    let newSelectedPerformanceTable = await context.prisma.performance.create({
      data: {
        polling: true,
        type: performanceType,
        businessTag: businessTag
          ? { connect: { id: businessTag.id } }
          : undefined,
        locationTag: locationTag
          ? { connect: { id: locationTag.id } }
          : undefined,
        updatedAt: todayMinOneH(),
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
    selectedPerformanceTable = newSelectedPerformanceTable;
    axios
      .get(`${API_URI}/api/performance`, {
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
      .then(async (response) => {
        let performanceUpdate: PyPerformanceResponse = response.data;
        let performanceData = performanceUpdate.data.map(
          ({
            name,
            avgRating,
            avgReviews,
            numLocations,
            customerVolumeIndex,
            localCategoryIndex,
            localRetailIndex,
            nationalIndex,
          }) => {
            return {
              name: name || '-',
              avgRating: avgRating ? `${avgRating}` : null,
              customerVolumeIndex,
              localCategoryIndex,
              localRetailIndex,
              nationalIndex,
              numLocation: numLocations,
              numReview: avgReviews,
            };
          },
        );
        await context.prisma.performance.update({
          where: {
            id: newSelectedPerformanceTable.id,
          },
          data: {
            data: { create: performanceData },
            businessTag: businessTag
              ? { connect: { id: businessTag.id } }
              : undefined,
            locationTag: locationTag
              ? { connect: { id: locationTag.id } }
              : undefined,
            polling: false,
            updatedAt: new Date(),
          },
        });
      })
      .catch(async () => {
        await context.prisma.performance.update({
          where: { id: newSelectedPerformanceTable.id },
          data: {
            error: 'Failed to update Performance. Please try again.',
            polling: false,
            updatedAt: todayMinOneH(),
          },
        });
      });
  }
  return {
    table: selectedPerformanceTable,
    polling: selectedPerformanceTable.polling,
    error: selectedPerformanceTable.error,
  };
};

let performanceTable = queryField('performanceTable', {
  type: 'PerformancePolling',
  args: {
    performanceType: arg({ type: 'PerformanceTableType', required: true }),
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
  },
  resolve: performanceTableResolver,
});

export { performanceTable };
