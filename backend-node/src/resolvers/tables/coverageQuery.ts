import { queryField, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyCoverageResponse, PyCoverageData } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { LocationTag, BusinessTag } from '@prisma/client';

let coverageResolver: FieldResolver<'Query', 'coverageTable'> = async (
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

  let coverage;
  if (tableId) {
    let selectedCoverageById = await context.prisma.coverage.findOne({
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
    if (!selectedCoverageById) {
      throw new Error('Modal not Found.');
    }
    coverage = [selectedCoverageById];
  } else {
    coverage = await context.prisma.coverage.findMany({
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
    coverage = coverage.filter(
      ({ comparationTags }) => comparationTags.length === 0,
    );
  }

  let selectedCoverage;
  if (coverage.length) {
    selectedCoverage = coverage[0];
    let updateData = timeCheck(selectedCoverage.updatedAt);
    if (updateData) {
      try {
        let coverageUpdate = await getCoverageData(
          selectedCoverage.locationTag,
          selectedCoverage.businessTag,
        );
        let coverageData = convertCoverage(coverageUpdate.data);
        let rawCompareData: Array<PyCoverageData> = [];
        for (let comparationTag of selectedCoverage.comparationTags) {
          let compareCoverageUpdate = await getCoverageData(
            comparationTag.locationTag,
            comparationTag.businessTag,
          );
          rawCompareData = rawCompareData.concat(compareCoverageUpdate.data);
        }
        let compareData = convertCoverage(rawCompareData);
        await context.prisma.coverageData.deleteMany({
          where: {
            coverage: {
              id: selectedCoverage.id,
            },
          },
        });
        await context.prisma.compareCoverageData.deleteMany({
          where: {
            coverage: {
              id: selectedCoverage.id,
            },
          },
        });
        selectedCoverage = await context.prisma.coverage.update({
          where: { id: selectedCoverage.id },
          data: {
            data: { create: coverageData },
            compareData: { create: compareData },
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
      let coverageUpdate = await getCoverageData(locationTag, businessTag);
      // console.log(coverageUpdate)
      let coverageData = convertCoverage(coverageUpdate.data);
      selectedCoverage = await context.prisma.coverage.create({
        data: {
          data: { create: coverageData },
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
  return selectedCoverage;
};

const getCoverageData = async (
  locationTag: LocationTag | null | undefined,
  businessTag: BusinessTag | null | undefined,
) => {
  let coverageUpdate: PyCoverageResponse = (
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
  return coverageUpdate;
};

const convertCoverage = (coverageDataList: Array<PyCoverageData>) => {
  let coverageData = coverageDataList.map(
    ({ name, location, num_locations, coverage }) => {
      let insertCoverage = coverage.map(
        ({ business_name, num_locations, locations }) => {
          let insertLocations = locations.map(
            ({ lat, lng, name, address, num_reviews }) => {
              return {
                lat,
                lng,
                name,
                address,
                numReviews: num_reviews,
              };
            },
          );
          return {
            businessName: business_name || '_',
            numLocations: num_locations || 0,
            locations: insertLocations,
          };
        },
      );
      return {
        name: name || '-',
        location: location || '_',
        numLocations: num_locations || 0,
        coverageData:
          insertCoverage.length > 0 ? JSON.stringify(insertCoverage) : '[]',
      };
    },
  );
  return coverageData;
};

let coverageTable = queryField('coverageTable', {
  type: 'Coverage',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
  },
  resolve: coverageResolver,
});

export { coverageTable };
