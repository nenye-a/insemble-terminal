import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { BusinessTagCreateInput, LocationTagCreateInput } from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyPerformanceResponse, PyPerformanceData } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { todayMinXHour } from '../../helpers/todayMinXHour';
import {
  PerformanceDemoBasicOverallData,
  PerformanceDemoBasicAddressData,
  PerformanceDemoCompareData,
} from '../../constants/demoData';

let performanceTableResolver: FieldResolver<
  'Query',
  'performanceTable'
> = async (
  _: Root,
  { performanceType, businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  if (demo) {
    let demoTables = await context.prisma.performance.findMany({
      where: {
        demo,
        type: performanceType,
      },
    });
    let demoTable;
    if (!demoTables.length) {
      let businessTag: BusinessTagCreateInput = {
        params: 'Starbucks',
        type: 'BUSINESS',
      };
      let demoBusinessTag;
      let businessTagsCheck = await context.prisma.businessTag.findMany({
        where: {
          params: businessTag.params,
          type: businessTag.type,
        },
      });
      if (businessTagsCheck.length) {
        demoBusinessTag = businessTagsCheck[0];
      } else {
        demoBusinessTag = await context.prisma.businessTag.create({
          data: {
            params: businessTag.params,
            type: businessTag.type,
          },
        });
      }
      let locationTag: LocationTagCreateInput = {
        params: 'Los Angeles, CA, USA',
        type: 'CITY',
      };
      let demoLocationTag;
      let locationTagsCheck = await context.prisma.locationTag.findMany({
        where: {
          params: locationTag.params,
          type: locationTag.type,
        },
      });
      if (locationTagsCheck.length) {
        demoLocationTag = locationTagsCheck[0];
      } else {
        demoLocationTag = await context.prisma.locationTag.create({
          data: {
            params: locationTag.params,
            type: locationTag.type,
          },
        });
      }
      switch (demo) {
        case 'BASIC':
          demoTable = await context.prisma.performance.create({
            data: {
              data: {
                create:
                  performanceType === 'OVERALL'
                    ? PerformanceDemoBasicOverallData
                    : PerformanceDemoBasicAddressData,
              },
              type: performanceType,
              businessTag: { connect: { id: demoBusinessTag.id } },
              locationTag: { connect: { id: demoLocationTag.id } },
              demo,
            },
          });
          break;
        case 'WITH_COMPARE':
          let compareBusinessTag: BusinessTagCreateInput = {
            params: 'The Cheesecake Factory',
            type: 'BUSINESS',
          };
          let demoCompareBusinessTag;
          let compareBusinessTagsCheck = await context.prisma.businessTag.findMany(
            {
              where: {
                params: compareBusinessTag.params,
                type: compareBusinessTag.type,
              },
            },
          );
          if (compareBusinessTagsCheck.length) {
            demoCompareBusinessTag = compareBusinessTagsCheck[0];
          } else {
            demoCompareBusinessTag = await context.prisma.businessTag.create({
              data: {
                params: compareBusinessTag.params,
                type: compareBusinessTag.type,
              },
            });
          }
          let compareLocationTag: LocationTagCreateInput = {
            params: 'Los Angeles, CA, USA',
            type: 'CITY',
          };
          let demoCompareLocationTag;
          let compareLocationTagsCheck = await context.prisma.locationTag.findMany(
            {
              where: {
                params: compareLocationTag.params,
                type: compareLocationTag.type,
              },
            },
          );
          if (compareLocationTagsCheck.length) {
            demoCompareLocationTag = compareLocationTagsCheck[0];
          } else {
            demoCompareLocationTag = await context.prisma.locationTag.create({
              data: {
                params: compareLocationTag.params,
                type: compareLocationTag.type,
              },
            });
          }
          let comparationTags = await context.prisma.comparationTag.findMany({
            where: {
              businessTag: demoCompareBusinessTag
                ? { id: demoCompareBusinessTag.id }
                : undefined,
              locationTag: demoCompareLocationTag
                ? { id: demoCompareLocationTag.id }
                : undefined,
            },
            include: { businessTag: true, locationTag: true },
          });
          let comparationTag;
          if (!comparationTags.length) {
            comparationTag = await context.prisma.comparationTag.create({
              data: {
                businessTag: demoCompareBusinessTag
                  ? { connect: { id: demoCompareBusinessTag.id } }
                  : undefined,
                locationTag: demoCompareLocationTag
                  ? { connect: { id: demoCompareLocationTag.id } }
                  : undefined,
              },
              include: { businessTag: true, locationTag: true },
            });
          } else {
            comparationTag = comparationTags[0];
          }
          let compareId = comparationTag.id;
          let compareData = PerformanceDemoCompareData.map((data) => ({
            ...data,
            compareId: compareId,
          }));
          if (performanceType === 'OVERALL') {
            demoTable = await context.prisma.performance.create({
              data: {
                comparationTags: { connect: { id: comparationTag.id } },
                compareData: { create: compareData },
                data: { create: PerformanceDemoBasicOverallData },
                type: 'OVERALL',
                demo,
              },
            });
          }
          break;
      }
    } else {
      demoTable = demoTables[0];
    }

    return {
      table: demoTable,
      polling: false,
      error: null,
    };
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
    if (selectedPerformanceById.demo) {
      return {
        table: selectedPerformanceById,
        polling: false,
        error: null,
      };
    }
    performance = [selectedPerformanceById];
  } else {
    performance = await context.prisma.performance.findMany({
      where: {
        type: performanceType,
        businessTag: businessTag ? { id: businessTag.id } : null,
        locationTag: locationTag ? { id: locationTag.id } : null,
        demo: null,
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
          updatedAt: todayMinXHour(1),
        },
      });
      return {
        table,
        error: selectedPerformanceTable.error,
        polling: selectedPerformanceTable.polling,
      };
    }
    let updateData = timeCheck(
      selectedPerformanceTable.updatedAt,
      TABLE_UPDATE_TIME,
    );
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
                numNearby,
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
                  numNearby,
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
                numNearby,
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
                  numNearby,
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
                updatedAt: todayMinXHour(1),
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
        updatedAt: todayMinXHour(1),
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
            numNearby,
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
              numNearby,
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
            updatedAt: todayMinXHour(1),
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
    demo: arg({ type: 'DemoType' }),
  },
  resolve: performanceTableResolver,
});

export { performanceTable };
