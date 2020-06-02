import { queryField, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyActivityData, PyActivityTimes, PyActivityResponse } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { LocationTag, BusinessTag } from '@prisma/client';

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
    let updateData = timeCheck(selectedActivity.updatedAt);
    if (updateData) {
      // update data (should be likely combined with if no table exists)
      try {
        let activityUpdate = await getActivityData(
          selectedActivity.locationTag,
          selectedActivity.businessTag,
        );
        let activityData = activityUpdate.data.map(
          ({ name, location, activity }) => {
            return {
              name: name || '-',
              location: location || '-',
              activityData: { create: flipKeys(activity) },
            };
          },
        );
        let rawCompareData: Array<PyActivityData> = [];
        for (let comparationTag of selectedActivity.comparationTags) {
          let compareDataUpdate = await getActivityData(
            comparationTag.locationTag,
            comparationTag.businessTag,
          );
          rawCompareData = rawCompareData.concat(compareDataUpdate.data);
        }
        let compareData = rawCompareData.map(({ name, location, activity }) => {
          return {
            name: name || '-',
            location: location || '-',
            activityData: { create: flipKeys(activity) },
          };
        });
        await context.prisma.activityData.deleteMany({
          where: {
            activity: {
              id: selectedActivity.id,
            },
          },
        });
        await context.prisma.compareActivityData.deleteMany({
          where: {
            activity: {
              id: selectedActivity.id,
            },
          },
        });
        selectedActivity = await context.prisma.activity.update({
          where: { id: selectedActivity.id },
          data: {
            data: { create: activityData },
            compareData: { create: compareData },
            updatedAt: new Date(),
          },
        });
      } catch (e) {
        console.log(e);
        throw new Error('Fail to update date.');
      }
    }
  } else {
    try {
      let activityUpdate = await getActivityData(locationTag, businessTag);
      let activityData = activityUpdate.data.map(
        ({ name, location, activity }) => {
          return {
            name: name || '-',
            location: location || '-',
            activityData: { create: flipKeys(activity) },
          };
        },
      );
      selectedActivity = await context.prisma.activity.create({
        data: {
          data: { create: activityData },
          businessTag: businessTag
            ? { connect: { id: businessTag.id } }
            : undefined,
          locationTag: locationTag
            ? { connect: { id: locationTag.id } }
            : undefined,
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error('Fail to create data.');
    }
  }
  return selectedActivity;
};

const getActivityData = async (
  locationTag: LocationTag | null | undefined,
  businessTag: BusinessTag | null | undefined,
) => {
  let activityUpdate: PyActivityResponse = (
    await axios.get(`${API_URI}/api/activity`, {
      params: {
        location: locationTag
          ? {
              locationType: locationTag.type,
              params: locationTag.params,
            }
          : undefined,
        business: businessTag
          ? {
              businessType: businessTag.type,
              params: businessTag.params,
            }
          : undefined,
      },
      paramsSerializer: axiosParamsSerializer,
    })
  ).data;
  return activityUpdate;
};

const flipKeys = (activity: PyActivityTimes) => {
  let activityData = Object();
  for (let [key, value] of Object.entries(activity)) {
    /* '1AM' -> 'AM1' or '12AM' -> 'AM12' */
    let newKey = key.slice(-2).concat(key.slice(0, -2));
    activityData[newKey] = value;
  }
  return activityData;
};

let activityTable = queryField('activityTable', {
  type: 'Activity',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
  },
  resolve: activityResolver,
});

export { activityTable };
