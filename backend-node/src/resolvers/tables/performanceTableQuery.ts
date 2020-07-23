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
    /**
     * Endpoint for geting performance table. This is polling endpoint.
     * If there is demo in args then it's automaticaly use demo data.
     * demo consist 'BASIC' and 'WITH_COMPARE'
     */
    if (demo) {
      /**
       * Here we search all table with the same demo params.
       */
      let demoTables = await context.prisma.performance.findMany({
        where: {
          demo,
          type: performanceType,
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
             * If BASIC then we're just add PerformanceDemoBasicOverallData if OVERALL.
             * and else PerformanceDemoBasicAddressData. The demo only OVERALL and ADDRESS.
             * The demo data can be seen at demoData.ts.
             */
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
            /**
             * If WITH_COMPARE we check first the comparation Tag.
             */
            let compareBusinessTag: BusinessTagCreateInput = {
              params: 'The Cheesecake Factory',
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
              params: 'Los Angeles, CA, USA',
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
             * Then replace compareId on PerformanceDemoCompareData with new created
             * comparationTag.id.
             */
            let compareData = PerformanceDemoCompareData.map((data) => ({
              ...data,
              compareId: compareId,
            }));
            if (performanceType === 'OVERALL') {
              /**
               * And here we create the demo table with the data and compare data demo
               * only if the performanceType === 'OVERALL'. Since we only have OVERALL
               * comperation demo right now.
               */
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
    let performance;
    /**
     * Or the user already know the table want to get with tableId. (Usally used
     * on pinned and comparation table)
     * It will search table by Id here.
     */
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
        /**
         * But if it's demo then we won't do anything to that table and just return it.
         */
        return {
          table: selectedPerformanceById,
          polling: false,
          error: null,
        };
      }
      performance = [selectedPerformanceById];
    } else {
      /**
       * If it's not by id then we search it with business and location tag.
       */
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
      /**
       * Here we search for table who doesn't have any comparation. (BASIC TABLE)
       */
      performance = performance.filter(
        ({ comparationTags }) => comparationTags.length === 0,
      );
    }

    let selectedPerformanceTable;
    /**
     * Here we check if the table exist from process above.
     */
    if (performance.length) {
      /**
       * If exist then we're just use the first found table.
       */
      selectedPerformanceTable = performance[0];
      let selectedTable = performance[0];
      if (selectedPerformanceTable.error) {
        /**
         * Because it's polling the error can come not in sync,
         * if there is an error on selectedPerformanceTable then we return it here
         * and remove it so next poll wont show error anymore.
         * And also we make it updatedAt outdated because if it's not, by default
         * updatedAt will replaced to today, this will prevent table to reupdate.
         */
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
      /**
       * If selectedPerformanceTable process is not polling
       * and the data must be updated then we start the process polling.
       */
      if (updateData) {
        if (!selectedPerformanceTable.polling) {
          /**
           * Here we flag the performance as polling.
           * Also we make updatedAt as outdated so it won't make it's looks like
           * updated.
           */
          selectedPerformanceTable = await context.prisma.performance.update({
            where: { id: selectedTable.id },
            data: {
              polling: true,
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
          /**
           * We search all table with same tag for getting basic table.
           */
          let tablesWithSameTag = await context.prisma.performance.findMany({
            where: {
              type: performanceType,
              businessTag: selectedPerformanceTable.businessTag
                ? { id: selectedPerformanceTable.businessTag.id }
                : null,
              locationTag: selectedPerformanceTable.locationTag
                ? { id: selectedPerformanceTable.locationTag.id }
                : null,
              demo: null,
            },
            include: {
              locationTag: true,
              businessTag: true,
              data: true,
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
          let [basicTable] = tablesWithSameTag.filter(
            ({ comparationTags }) => comparationTags.length === 0,
          );
          /**
           * If there is basicTable then we check it if it's outdated or not.
           * If no basicTable found then it's will be undefined.
           */
          let updateBasicData = basicTable
            ? timeCheck(basicTable.updatedAt, TABLE_UPDATE_TIME)
            : undefined;
          let mainDataPromise;
          if (basicTable && !updateBasicData) {
            /**
             * If not outdated we use the data from basic table. This promise
             * is the same type as mainDataPromise. So the data will have same
             * type promise when resolved.
             */
            mainDataPromise = new Promise<AxiosResponse>((resolve, reject) => {
              if (basicTable.data.length) {
                resolve({
                  data: {
                    /**
                     * Here we revert the data back to Python response so not change
                     * the most of code. And we mark this data as dataQueue.
                     */
                    dataQueue: true,
                    createAt: basicTable.createdAt,
                    updatedAt: basicTable.updatedAt,
                    dataType: basicTable.type,
                    data: basicTable.data.map(
                      ({
                        name,
                        avgRating,
                        numReview,
                        numLocation,
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
                          numLocations: numLocation,
                          avgReviews: numReview,
                          numNearby,
                        };
                      },
                    ),
                  },
                  config: null,
                  headers: null,
                  status: 200,
                  statusText: 'success',
                });
              } else {
                reject();
              }
            });
          } else {
            /**
             * Here we fetch for main data if basic table not outdated.
             * This will run async so we got promise here.
             */
            mainDataPromise = axios.get(`${API_URI}/api/performance`, {
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
          }
          /**
           * Here we create array to keep all of the compare promise and compareId.
           */
          let compareDataPromises: Array<Promise<AxiosResponse>> = [];
          let compareIds: Array<string> = [];
          for (let comparationTag of selectedPerformanceTable.comparationTags) {
            /**
             * And here we fetch every comparationTags combination and
             * get all compare promises.
             */
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
          Promise.allSettled([mainDataPromise, ...compareDataPromises])
            .then(async (value) => {
              /**
               * Here we separate main data and compare data responses.
               */
              let fulfilledValue = value.filter(({ status }) => status === "fulfilled").map(
                // @ts-ignore
                res => res.value
              );

              let [mainResponse, ...compareResponses] = fulfilledValue;
              let mainData: PyPerformanceResponse = mainResponse.data;
              /**
               * Here we parse performance data we got from response into our
               * db type.
               */
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
                /**
                 * Here every compareResponses the data we put all data we get
                 * into one array.
                 */
                let compareData: PyPerformanceResponse = compareResponse.data;
                rawCompareData = rawCompareData.concat(
                  compareData.data.map((data) => ({
                    ...data,
                    compareId: compareIds[index],
                  })),
                );
              }
              /**
               * And then we parse compare performance data we got from response into our
               * db type.
               */
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
              if (!mainResponse.data.dataQueue) {
                if (basicTable && basicTable.id) {
                  /**
                   * If the data is from fetch(not data queue) and there is
                   * basicTable then we also update the basic table here.
                   */
                  await context.prisma.performanceData.deleteMany({
                    where: {
                      performance: {
                        id: basicTable.id,
                      },
                    },
                  });
                  await context.prisma.comparePerformanceData.deleteMany({
                    where: {
                      performance: {
                        id: basicTable.id,
                      },
                    },
                  });
                  await context.prisma.performance.update({
                    where: { id: basicTable.id },
                    data: {
                      data: { create: performanceData },
                      polling: false,
                      updatedAt: new Date(),
                    },
                  });
                }
              }
              /**
               * Here we delete all old data and compareData.
               */
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
              /**
               * Then finally we update the table here with data we parse above.
               */
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
            .catch(async (err) => {
              console.log(err)
              /**
               * ".catch" is if the fetch failed. We put the error here.
               * Then mark the updatedAt as outdated and polling false
               * so if it run again it will poll again.
               */
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
      /**
       * Here is the case when there is no basic table.
       * So we create one here. Basically the same as above but without
       * comparison. So only one promise for main data.
       * First we create the empty table.
       */
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
      /**
       * Here we fetch to python API to get the latest data.
       * We're not await it so this function will fetch,
       * after fetch done the ".then"  will run async.
       */
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
          /**
           * Here we parse performance data we got from response into our
           * db type.
           */
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
          /**
           * Then we update the empty table with the data here.
           */
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
          /**
           * ".catch" is if the fetch failed. We put the error here.
           * Then mark the updatedAt as outdated and polling false
           * so if it run again it will poll again.
           */
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
    /**
     * Here we return all data front end need.
     * Including polling status, error message, and table.
     */
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
