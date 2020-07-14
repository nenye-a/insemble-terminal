import { queryField, FieldResolver, stringArg, arg } from 'nexus';
import axios from 'axios';

import {
  LocationTag,
  BusinessTag,
  BusinessTagCreateInput,
  LocationTagCreateInput,
} from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyMapResponse, PyMapData } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { MapDemoData, MapDemoCompareData } from '../../constants/demoData';

let mapResolver: FieldResolver<'Query', 'mapTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  if (demo) {
    let demoTables = await context.prisma.map.findMany({
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
          let compareBusinessTag: BusinessTagCreateInput = {
            params: 'Sandwich',
            type: 'CATEGORY',
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
          let compareData = MapDemoCompareData.map((data) => ({
            ...data,
            compareId: compareId,
          }));

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
      demoTable = demoTables[0];
    }

    return demoTable;
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

  let map;
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
      return selectedMapById;
    }
    map = [selectedMapById];
  } else {
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
    map = map.filter(({ comparationTags }) => comparationTags.length === 0);
  }

  let selectedMap;
  if (map.length) {
    selectedMap = map[0];
    let updateData = timeCheck(selectedMap.updatedAt, TABLE_UPDATE_TIME);
    if (updateData) {
      try {
        let mapUpdate = await getMapData(
          selectedMap.locationTag,
          selectedMap.businessTag,
        );
        let mapData = convertMap(mapUpdate.data);
        let rawCompareData: Array<PyMapData & { compareId: string }> = [];
        for (let comparationTag of selectedMap.comparationTags) {
          let compareMapUpdate = await getMapData(
            comparationTag.locationTag,
            comparationTag.businessTag,
          );
          rawCompareData = rawCompareData.concat(
            compareMapUpdate.data.map((data) => ({
              ...data,
              compareId: comparationTag.id,
            })),
          );
        }
        let compareData = convertMap(rawCompareData);
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
        selectedMap = await context.prisma.map.update({
          where: { id: selectedMap.id },
          data: {
            data: { create: mapData },
            compareData: { create: compareData as Array<CompareData> },
            updatedAt: new Date(),
          },
        });
      } catch (e) {
        console.log(e);
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      let mapUpdate = await getMapData(locationTag, businessTag);
      let mapData = convertMap(mapUpdate.data);
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
      console.log(e);
      throw new Error('Failed to create data.');
    }
  }
  return selectedMap;
};

const getMapData = async (
  locationTag: LocationTag | null | undefined,
  businessTag: BusinessTag | null | undefined,
) => {
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
