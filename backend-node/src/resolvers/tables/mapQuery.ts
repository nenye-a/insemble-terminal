import { queryField, FieldResolver, stringArg, arg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyMapResponse, PyMapData } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { LocationTag, BusinessTag } from '@prisma/client';

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
    let demoTable = demoTables[0];
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
