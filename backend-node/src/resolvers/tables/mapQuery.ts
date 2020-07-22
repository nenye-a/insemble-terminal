import { queryField, FieldResolver, stringArg, arg } from 'nexus';
import axios from 'axios';

import {
  LocationTag,
  BusinessTag,
  BusinessTagCreateInput,
  LocationTagCreateInput,
} from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyMapResponse, PyMapData, BusinessData } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { MapDemoData, MapDemoCompareData } from '../../constants/demoData';

let mapResolver: FieldResolver<'Query', 'mapTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  /**
   * Endpoint for geting map table.
   * If there is demo in args then it's automaticaly use demo data.
   * demo consist 'BASIC' and 'WITH_COMPARE'
   */
  if (demo) {
    /**
     * Here we search all table with the same demo params.
     */
    let demoTables = await context.prisma.map.findMany({
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
           * If BASIC then we're just add MapDemoData.
           * The demo data can be seen at demoData.ts.
           */
          demoTable = await context.prisma.map.create({
            data: {
              data: {
                create: MapDemoData,
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
            params: 'Sandwich',
            type: 'CATEGORY',
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
           * Then replace compareId on MapDemoCompareData with new created
           * comparationTag.id.
           */
          let compareData = MapDemoCompareData.map((data) => ({
            ...data,
            compareId: compareId,
          }));

          /**
           * And here we create the demo table with the data and compare data demo.
           */
          demoTable = await context.prisma.map.create({
            data: {
              comparationTags: { connect: { id: comparationTag.id } },
              compareData: { create: compareData },
              data: { create: MapDemoData },
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

    return demoTable;
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

  let map;
  /**
   * Or the user already know the table want to get with tableId. (Usally used
   * on pinned and comparation table)
   * It will search table by Id here.
   */
  if (tableId) {
    let selectedMapById = await context.prisma.map.findOne({
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
    if (!selectedMapById) {
      throw new Error('Modal not Found.');
    }
    if (selectedMapById.demo) {
      /**
       * But if it's demo then we won't do anything to that table and just return it.
       */
      return selectedMapById;
    }
    map = [selectedMapById];
  } else {
    /**
     * If it's not by id then we search it with business and location tag.
     */
    map = await context.prisma.map.findMany({
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
    map = map.filter(({ comparationTags }) => comparationTags.length === 0);
  }

  let selectedMap;
  /**
   * Here we check if the table exist from process above.
   */
  if (map.length) {
    selectedMap = map[0];
    /**
     * If exist then we're just use the first found table.
     */
    let updateData = timeCheck(selectedMap.updatedAt, TABLE_UPDATE_TIME);
    /**
     * If table outdated from timeCheck then we have to update data.
     */
    if (updateData) {
      try {
        /**
         * Here we getting the map data and put it on mapUpdate.
         */
        let mapUpdate: PyMapResponse & { dataQueue?: boolean };
        /**
         * We search all table with same tag for getting basic table.
         */
        let tablesWithSameTag = await context.prisma.map.findMany({
          where: {
            businessTag: businessTag ? { id: businessTag.id } : null,
            locationTag: locationTag ? { id: locationTag.id } : null,
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
         */
        let updateBasicData = timeCheck(
          basicTable.updatedAt,
          TABLE_UPDATE_TIME,
        );
        if (basicTable && !updateBasicData) {
          /**
           * If not outdated we use the data from basic table.
           */
          mapUpdate = {
            /**
             * Here we revert the data back to Python response so not change
             * the most of code. And we mark this data as dataQueue.
             */
            dataQueue: true,
            createdAt: basicTable.createdAt,
            updatedAt: basicTable.updatedAt,
            data: basicTable.data.map(
              ({ name, location, numLocations, coverageData }) => {
                let parseBusinessData: Array<BusinessData> = JSON.parse(
                  coverageData || '[]',
                );
                let insertMap = parseBusinessData.map(
                  ({ businessName, numLocations, locations }) => {
                    let insertLocations = locations.map(
                      ({ lat, lng, name, address, numReviews, rating }) => {
                        return {
                          lat,
                          lng,
                          name,
                          rating,
                          address,
                          num_reviews: numReviews,
                        };
                      },
                    );
                    return {
                      business_name: businessName || '_',
                      num_locations:
                        numLocations === '-' ? Number(numLocations) : null,
                      locations: insertLocations,
                    };
                  },
                );
                return {
                  name: name || '-',
                  location: location || '_',
                  num_locations:
                    numLocations === '-' ? Number(numLocations) : null,
                  coverage: insertMap,
                };
              },
            ),
          };
        } else {
          /**
           * If data outdated and there is no basic table then we fetch again here.
           */
          mapUpdate = await getMapData(
            selectedMap.locationTag,
            selectedMap.businessTag,
          );
        }
        /**
         * Then we parse the data here with convertMap.
         */
        let mapData = convertMap(mapUpdate.data);
        /**
         * Here we create array to keep all python compare data.
         */
        let rawCompareData: Array<PyMapData & { compareId: string }> = [];
        for (let comparationTag of selectedMap.comparationTags) {
          /**
           * And here we fetch every comparationTags combination and
           * get all compare data.
           */
          let compareMapUpdate = await getMapData(
            comparationTag.locationTag,
            comparationTag.businessTag,
          );
          /**
           * Here we put the data into array that we create before with compareId.
           */
          rawCompareData = rawCompareData.concat(
            compareMapUpdate.data.map((data) => ({
              ...data,
              compareId: comparationTag.id,
            })),
          );
        }
        /**
         * All compare data that we put in one array parsed here.
         */
        let compareData = convertMap(rawCompareData);
        if (!mapUpdate.dataQueue) {
          if (basicTable.id) {
            /**
             * If the data is from fetch(not data queue) and there is
             * basicTable then we also update the basic table here.
             */
            await context.prisma.mapData.deleteMany({
              where: {
                map: {
                  id: basicTable.id,
                },
              },
            });
            await context.prisma.compareMapData.deleteMany({
              where: {
                map: {
                  id: basicTable.id,
                },
              },
            });
            await context.prisma.map.update({
              where: { id: basicTable.id },
              data: {
                data: { create: mapData },
                updatedAt: new Date(),
              },
            });
          }
        }
        /**
         * Here we delete all old data and compareData.
         */
        await context.prisma.mapData.deleteMany({
          where: {
            map: {
              id: selectedMap.id,
            },
          },
        });
        await context.prisma.compareMapData.deleteMany({
          where: {
            map: {
              id: selectedMap.id,
            },
          },
        });
        /**
         * Then finally we update the table here with data we parse above.
         */
        selectedMap = await context.prisma.map.update({
          where: { id: selectedMap.id },
          data: {
            data: { create: mapData },
            compareData: { create: compareData as Array<CompareData> },
            updatedAt: new Date(),
          },
        });
      } catch (e) {
        /**
         * Then if something wrong then we throw an error.
         */
        console.log(e);
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      /**
       * Here is the case when there is no basic table.
       * So we create one here. Basically the same as above but without
       * comparison. So only for main data.
       * Here we get the data from python.
       */
      let mapUpdate = await getMapData(locationTag, businessTag);
      /**
       * Then we parse the data here with convertMap.
       */
      let mapData = convertMap(mapUpdate.data);
      /**
       * Then we create table with the data here.
       */
      selectedMap = await context.prisma.map.create({
        data: {
          data: { create: mapData },
          businessTag: businessTag
            ? { connect: { id: businessTag.id } }
            : undefined,
          locationTag: locationTag
            ? { connect: { id: locationTag.id } }
            : undefined,
        },
      });
    } catch (e) {
      /**
       * Then if something wrong then we throw an error.
       */
      console.log(e);
      throw new Error('Failed to create data.');
    }
  }
  /**
   * Here we return all data front end need.
   */
  return selectedMap;
};

const getMapData = async (
  locationTag: LocationTag | null | undefined,
  businessTag: BusinessTag | null | undefined,
) => {
  /**
   * This function is for fetching data to python endpoint
   * and return the python data.
   */
  let mapUpdate: PyMapResponse = (
    await axios.get(`${API_URI}/api/coverage`, {
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
  return mapUpdate;
};

const convertMap = (mapDataList: Array<PyMapData & { compareId?: string }>) => {
  /**
   * This function is for parsing the pyhton data to our DB data type.
   */
  let mapData = mapDataList.map(
    ({ name, location, num_locations, coverage, compareId }) => {
      let insertMap = coverage.map(
        ({ business_name, num_locations, locations }) => {
          let insertLocations = locations.map(
            ({ lat, lng, name, address, num_reviews, rating }) => {
              return {
                lat,
                lng,
                name,
                rating,
                address,
                numReviews: num_reviews,
              };
            },
          );
          return {
            businessName: business_name || '_',
            numLocations: num_locations ? `${num_locations}` : '-',
            locations: insertLocations,
          };
        },
      );
      return {
        name: name || '-',
        location: location || '_',
        numLocations: num_locations ? `${num_locations}` : '-',
        coverageData: insertMap.length > 0 ? JSON.stringify(insertMap) : '[]',
        compareId: compareId,
      };
    },
  );
  return mapData;
};
type CompareData = {
  name: string;
  location: string;
  numLocations: string;
  coverageData: string;
  compareId: string;
};

let mapTable = queryField('mapTable', {
  type: 'Map',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
    demo: arg({ type: 'DemoType' }),
  },
  resolve: mapResolver,
});

export { mapTable };
