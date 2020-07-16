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
  /**
   * Endpoint for geting activity table. This is polling endpoint.
   * If there is demo in args then it's automaticaly use demo data.
   * demo consist 'BASIC' and 'WITH_COMPARE'
   */
  if (demo) {
    /**
     * Here we search all table with the same demo params.
     */
    let demoTables = await context.prisma.activity.findMany({
      where: {
        demo,
      },
    });
    let demoTable;
    if (!demoTables.length) {
      /**
       * If it's doesn't exist then we create new with this parameter.
       */
      let businessTag: BusinessTagCreateInput = {
        params: 'Starbucks',
        type: 'BUSINESS',
      };
      let demoBusinessTag;
      /**
       * Here we checking if tag exist or not.
       */
      let businessTagsCheck = await context.prisma.businessTag.findMany({
        where: {
          params: businessTag.params,
          type: businessTag.type,
        },
      });
      if (businessTagsCheck.length) {
        /**
         * If exist then use the first found.
         */
        demoBusinessTag = businessTagsCheck[0];
      } else {
        /**
         * Else create new tags.
         */
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
      /**
       * Here we checking if tag exist or not.
       */
      let locationTagsCheck = await context.prisma.locationTag.findMany({
        where: {
          params: locationTag.params,
          type: locationTag.type,
        },
      });
      if (locationTagsCheck.length) {
        /**
         * If exist then use the first found.
         */
        demoLocationTag = locationTagsCheck[0];
      } else {
        /**
         * Else create new tags.
         */
        demoLocationTag = await context.prisma.locationTag.create({
          data: {
            params: locationTag.params,
            type: locationTag.type,
          },
        });
      }
      switch (demo) {
        /**
         * Here we separate the case base on demo params.
         * It's because both of them is different table with different set of data.
         */
        case 'BASIC':
          /**
           * If BASIC then we're just add ActivityDemoData.
           * The demo data can be seen at demoData.ts.
           */
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
          /**
           * If WITH_COMPARE we check first the comparation Tag.
           */
          let compareBusinessTag: BusinessTagCreateInput = {
            params: 'Starbucks',
            type: 'BUSINESS',
          };
          let demoCompareBusinessTag;
          /**
           * Here we checking if tag exist or not.
           */
          let compareBusinessTagsCheck = await context.prisma.businessTag.findMany(
            {
              where: {
                params: compareBusinessTag.params,
                type: compareBusinessTag.type,
              },
            },
          );
          if (compareBusinessTagsCheck.length) {
            /**
             * If exist then use the first found.
             */
            demoCompareBusinessTag = compareBusinessTagsCheck[0];
          } else {
            /**
             * Else create new tags.
             */
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
          /**
           * Here we checking if tag exist or not.
           */
          let compareLocationTagsCheck = await context.prisma.locationTag.findMany(
            {
              where: {
                params: compareLocationTag.params,
                type: compareLocationTag.type,
              },
            },
          );
          if (compareLocationTagsCheck.length) {
            /**
             * If exist then use the first found.
             */
            demoCompareLocationTag = compareLocationTagsCheck[0];
          } else {
            /**
             * Else create new tags.
             */
            demoCompareLocationTag = await context.prisma.locationTag.create({
              data: {
                params: compareLocationTag.params,
                type: compareLocationTag.type,
              },
            });
          }
          /**
           * Then we check if the tags set already exist on comparationTag.
           */
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
            /**
             * If not exist then create new comparationTag set.
             */
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
            /**
             * Else use the first found.
             */
            comparationTag = comparationTags[0];
          }
          let compareId = comparationTag.id;
          /**
           * Then replace compareId on ActivityDemoCompareData with new created
           * comparationTag.id.
           */
          let compareData = ActivityDemoCompareData.map((data) => ({
            ...data,
            compareId: compareId,
          }));

          /**
           * And here we create the demo table with the data and compare data demo.
           */
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
      /**
       * If there's already demo table then we use the first found.
       * NOTE: because it's first found, multiple demo (example:BASIC)
       * table will be ignored except there is another search value.
       */
      demoTable = demoTables[0];
    }

    return {
      table: demoTable,
      polling: false,
      error: null,
    };
  }
  /**
   * If not demo table we check if there is businessTagId and locationTagId
   * and get the tag.
   */
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
  /**
   * Or the user already know the table want to get with tableId. (Usally used
   * on pinned and comparation table)
   * It will search table by Id here.
   */
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
      /**
       * But if it's demo then we won't do anything to that table and just return it.
       */
      return {
        table: selectedActivityById,
        polling: false,
        error: null,
      };
    }
    activity = [selectedActivityById];
  } else {
    /**
     * If it's not by id then we search it with business and location tag.
     */
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
    /**
     * Here we search for table who doesn't have any comparation. (BASIC TABLE)
     */
    activity = activity.filter(
      ({ comparationTags }) => comparationTags.length === 0,
    );
  }

  let selectedActivity;
  /**
   * Here we check if the table exist from process above.
   */
  if (activity.length) {
    // Return the table without any comparison tags.
    /**
     * If exist then we're just use the first found table.
     */
    selectedActivity = activity[0];
    let selectedTable = activity[0];
    if (selectedActivity.error) {
      /**
       * Because it's polling the error can come not in sync,
       * if there is an error on selectedActivity then we return it here
       * and remove it so next poll wont show error anymore.
       * And also we make it updatedAt outdated because if it's not, by default
       * updatedAt will replaced to today, this will prevent table to reupdate.
       */
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
    /**
     * If selectedActivity process is not polling
     * and the data must be updated then we start the process polling.
     */
    if (updateData) {
      // update data (should be likely combined with if no table exists)
      if (!selectedActivity.polling) {
        /**
         * Here we flag the activity as polling.
         */
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
        /**
         * Here we fetch for main data first. This will run async so we got
         * promise here.
         */
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
        /**
         * Here we create array to keep all of the compare promise and compareId.
         */
        let compareDataPromises: Array<Promise<AxiosResponse>> = [];
        let compareIds: Array<string> = [];
        for (let comparationTag of selectedActivity.comparationTags) {
          /**
           * And here we fetch every comparationTags combination and
           * get all compare promises.
           */
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
          /**
           * Here we put the compareId and comparePromise into array that we
           * create before.
           */
          compareDataPromises.push(compareDataPromise);
          compareIds.push(comparationTag.id);
        }
        /**
         * Promise.all will be called if all of the promise(Fetch) complete.
         * using ".then()" function to run after it's all complete.
         */
        Promise.all([mainDataPromise, ...compareDataPromises])
          .then(async (value) => {
            /**
             * Here we separate main data and compare data responses.
             */
            let [mainResponse, ...compareResponses] = value;
            let mainData: PyActivityResponse = mainResponse.data;
            /**
             * Here we parse activity data we got from response into our
             * db type.
             */
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
              /**
               * Here every compareResponses the data we put all data we get
               * into one array.
               */
              let compareData: PyActivityResponse = compareResponse.data;
              rawCompareData = rawCompareData.concat(
                compareData.data.map((data) => ({
                  ...data,
                  compareId: compareIds[index],
                })),
              );
            }
            /**
             * And then we parse compare activity data we got from response into our
             * db type.
             */
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
            /**
             * Here we delete all old data and compareData.
             */
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
            /**
             * Then finally we update the table here with data we parse above.
             */
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
            /**
             * ".catch" is if the fetch failed. We put the error here.
             * Then mark the updatedAt as outdated and polling false
             * so if it run again it will poll again.
             */
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
    /**
     * Here is the case when there is no basic table.
     * So we create one here. Basically the same as above but without
     * comparison. So only one promise for main data.
     * First we create the empty table.
     */
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
    /**
     * Here we fetch to python API to get the latest data.
     * We're not await it so this function will fetch,
     * after fetch done the ".then"  will run async.
     */
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
        /**
         * Here we parse activity data we got from response into our
         * db type.
         */
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
        /**
         * Then we update the empty table with the data here.
         */
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
        /**
         * ".catch" is if the fetch failed. We put the error here.
         * Then mark the updatedAt as outdated and polling false
         * so if it run again it will poll again.
         */
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
  /**
   * Here we return all data front end need.
   * Including polling status, error message, and table.
   */
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
