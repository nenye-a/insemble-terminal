import { queryField, FieldResolver, stringArg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { Root, Context } from 'serverTypes';
import { PyActivityData, PyActivityResponse } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { LocationTag, BusinessTag } from '@prisma/client';
import { objectToActivityGraph } from '../../helpers/objectToActivityGraph';

let activityResolver: FieldResolver<'Query', 'activityTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId },
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
    activity = [selectedActivityById];
  } else {
    // Grab the activity from tag, location combination
    activity = await context.prisma.activity.findMany({
      where: {
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
        },
      });
      return {
        table,
        error: selectedActivity.error,
        polling: selectedActivity.polling,
      };
    }
    let updateData = timeCheck(selectedActivity.updatedAt);
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
          },
        });
      })
      .catch(async () => {
        await context.prisma.activity.update({
          where: { id: newSelectedActivityTable.id },
          data: {
            error: 'Failed to update Activity. Please try again.',
            polling: false,
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
  },
  resolve: activityResolver,
});

export { activityTable };
