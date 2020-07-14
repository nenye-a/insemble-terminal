import { queryField, FieldResolver, stringArg, arg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { BusinessTagCreateInput, LocationTagCreateInput } from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyActivityData, PyActivityResponse } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { objectToActivityGraph } from '../../helpers/objectToActivityGraph';
import { todayMinXHour } from '../../helpers/todayMinXHour';
import {
  ActivityDemoData,
  ActivityDemoCompareData,
} from '../../constants/demoData';

let activityResolver: FieldResolver<'Query', 'activityTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  if (demo) {
    let demoTables = await context.prisma.activity.findMany({
      where: {
        demo,
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
          demoTable = await context.prisma.activity.create({
            data: {
              data: {
                create: ActivityDemoData,
              },
              businessTag: { connect: { id: demoBusinessTag.id } },
              locationTag: { connect: { id: demoLocationTag.id } },
              demo,
            },
          });
          break;
        case 'WITH_COMPARE':
          let compareBusinessTag: BusinessTagCreateInput = {
            params: 'Starbucks',
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
            params: 'Santa Monica, CA, USA',
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
          let compareData = ActivityDemoCompareData.map((data) => ({
            ...data,
            compareId: compareId,
          }));

          demoTable = await context.prisma.activity.create({
            data: {
              comparationTags: { connect: { id: comparationTag.id } },
              compareData: { create: compareData },
              data: { create: ActivityDemoData },
              demo,
            },
          });
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

  let activity;
  if (tableId) {
    // Grab the activity from existing table
    let selectedActivityById = await context.prisma.activity.findOne({
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
    if (!selectedActivityById) {
      throw new Error('Modal not Found.');
    }
    if (selectedActivityById.demo) {
      return {
        table: selectedActivityById,
        polling: false,
        error: null,
      };
    }
    activity = [selectedActivityById];
  } else {
    // Grab the activity from tag, location combination
    activity = await context.prisma.activity.findMany({
      where: {
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
    activity = activity.filter(
      ({ comparationTags }) => comparationTags.length === 0,
    );
  }

  let selectedActivity;
  if (activity.length) {
    // Return the table without any comparison tags.
    selectedActivity = activity[0];
    let selectedTable = activity[0];
    if (selectedActivity.error) {
      let table = await context.prisma.activity.update({
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
        error: selectedActivity.error,
        polling: selectedActivity.polling,
      };
    }
    let updateData = timeCheck(selectedActivity.updatedAt, TABLE_UPDATE_TIME);
    if (updateData) {
      // update data (should be likely combined with if no table exists)
      if (!selectedActivity.polling) {
        selectedActivity = await context.prisma.activity.update({
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
        let mainDataPromise = axios.get(`${API_URI}/api/activity`, {
          params: {
            location: selectedActivity.locationTag
              ? {
                  locationType: selectedActivity.locationTag.type,
                  params: selectedActivity.locationTag.params,
                }
              : undefined,
            business: selectedActivity.businessTag
              ? {
                  businessType: selectedActivity.businessTag.type,
                  params: selectedActivity.businessTag.params,
                }
              : undefined,
          },
          paramsSerializer: axiosParamsSerializer,
        });
        let compareDataPromises: Array<Promise<AxiosResponse>> = [];
        let compareIds: Array<string> = [];
        for (let comparationTag of selectedActivity.comparationTags) {
          let compareDataPromise = axios.get(`${API_URI}/api/activity`, {
            params: {
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
            let mainData: PyActivityResponse = mainResponse.data;
            let activityData = mainData.data.map(
              ({ name, location, activity }) => {
                let arrayActiviy = objectToActivityGraph(
                  activity,
                  name,
                  location,
                );
                return {
                  name: name || '-',
                  location: location || '-',
                  activityData:
                    arrayActiviy.length > 0
                      ? JSON.stringify(arrayActiviy)
                      : '[]',
                };
              },
            );
            let rawCompareData: Array<PyActivityData & {
              compareId: string;
            }> = [];
            for (let [index, compareResponse] of compareResponses.entries()) {
              let compareData: PyActivityResponse = compareResponse.data;
              rawCompareData = rawCompareData.concat(
                compareData.data.map((data) => ({
                  ...data,
                  compareId: compareIds[index],
                })),
              );
            }
            let compareData = rawCompareData.map(
              ({ name, location, activity, compareId }) => {
                let arrayActiviy = objectToActivityGraph(
                  activity,
                  name,
                  location,
                );
                return {
                  name: name || '-',
                  location: location || '-',
                  activityData:
                    arrayActiviy.length > 0
                      ? JSON.stringify(arrayActiviy)
                      : '[]',
                  compareId,
                };
              },
            );
            await context.prisma.activityData.deleteMany({
              where: {
                activity: {
                  id: selectedTable.id,
                },
              },
            });
            await context.prisma.compareActivityData.deleteMany({
              where: {
                activity: {
                  id: selectedTable.id,
                },
              },
            });
            await context.prisma.activity.update({
              where: { id: selectedTable.id },
              data: {
                data: { create: activityData },
                compareData: { create: compareData },
                polling: false,
                updatedAt: new Date(),
              },
            });
          })
          .catch(async () => {
            await context.prisma.activity.update({
              where: { id: selectedTable.id },
              data: {
                error: 'Failed to update Activity. Please try again.',
                polling: false,
                updatedAt: todayMinXHour(1),
              },
            });
          });
      }
    }
  } else {
    let newSelectedActivityTable = await context.prisma.activity.create({
      data: {
        polling: true,
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
    selectedActivity = newSelectedActivityTable;
    axios
      .get(`${API_URI}/api/activity`, {
        params: {
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
        let activityUpdate: PyActivityResponse = response.data;
        let activityData = activityUpdate.data.map(
          ({ name, location, activity }) => {
            let arrayActiviy = objectToActivityGraph(activity, name, location);
            return {
              name: name || '-',
              location: location || '-',
              activityData:
                arrayActiviy.length > 0 ? JSON.stringify(arrayActiviy) : '[]',
            };
          },
        );
        await context.prisma.activity.update({
          where: {
            id: newSelectedActivityTable.id,
          },
          data: {
            data: { create: activityData },
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
        await context.prisma.activity.update({
          where: { id: newSelectedActivityTable.id },
          data: {
            error: 'Failed to update Activity. Please try again.',
            polling: false,
            updatedAt: todayMinXHour(1),
          },
        });
      });
  }
  return {
    polling: selectedActivity.polling,
    error: selectedActivity.error,
    table: selectedActivity,
  };
};

let activityTable = queryField('activityTable', {
  type: 'ActivityPolling',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
    demo: arg({ type: 'DemoType' }),
  },
  resolve: activityResolver,
});

export { activityTable };
