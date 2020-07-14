import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios from 'axios';

import { BusinessTagCreateInput, LocationTagCreateInput } from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyOwnershipInfoResponse } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { InfoDemoData } from '../../constants/demoData';

let ownershipInfoTableResolver: FieldResolver<
  'Query',
  'ownershipInfoTable'
> = async (
  _: Root,
  { ownershipType, businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  if (demo) {
    let demoTables = await context.prisma.ownershipInfo.findMany({
      where: {
        demo,
        type: ownershipType,
      },
    });
    let demoTable;
    if (!demoTables.length) {
      let businessTag: BusinessTagCreateInput = {
        params: 'Cheesecake Factory',
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
        params: '511 Americana Way, Glendale, CA 91210, USA',
        type: 'ADDRESS',
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
          if (ownershipType === 'COMPANY') {
            demoTable = await context.prisma.ownershipInfo.create({
              data: {
                data: {
                  create: InfoDemoData,
                },
                type: 'COMPANY',
                businessTag: { connect: { id: demoBusinessTag.id } },
                locationTag: { connect: { id: demoLocationTag.id } },
                demo,
              },
            });
          }
          break;
        case 'WITH_COMPARE':
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
  let ownershipInfo;
  if (tableId) {
    let selectedOwnershipInfoById = await context.prisma.ownershipInfo.findOne({
      where: { id: tableId },
      include: {
        locationTag: true,
        businessTag: true,
      },
    });
    if (!selectedOwnershipInfoById) {
      throw new Error('Table not found');
    }
    if (selectedOwnershipInfoById.demo) {
      return selectedOwnershipInfoById;
    }
    ownershipInfo = [selectedOwnershipInfoById];
  } else {
    ownershipInfo = await context.prisma.ownershipInfo.findMany({
      where: {
        type: ownershipType,
        businessTag: businessTag ? { id: businessTag.id } : null,
        locationTag: locationTag ? { id: locationTag.id } : null,
        demo: null,
      },
      include: {
        locationTag: true,
        businessTag: true,
      },
    });
  }

  let selectedOwnershipInfoTable;
  if (ownershipInfo.length) {
    selectedOwnershipInfoTable = ownershipInfo[0];
    let updateData = timeCheck(
      selectedOwnershipInfoTable.updatedAt,
      TABLE_UPDATE_TIME,
    );
    if (updateData) {
      try {
        let ownershipInfoUpdate: PyOwnershipInfoResponse = (
          await axios.get(`${API_URI}/api/info`, {
            params: {
              dataType: ownershipType,
              location: selectedOwnershipInfoTable.locationTag
                ? {
                    locationType: selectedOwnershipInfoTable.locationTag.type,
                    params: selectedOwnershipInfoTable.locationTag.params,
                  }
                : undefined,
              business: selectedOwnershipInfoTable.businessTag
                ? {
                    businessType: selectedOwnershipInfoTable.businessTag.type,
                    params: selectedOwnershipInfoTable.businessTag.params,
                  }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          })
        ).data;
        let ownershipInfoData = ownershipInfoUpdate.data;
        await context.prisma.ownershipInfoData.deleteMany({
          where: {
            ownershipInfoes: {
              some: {
                id: selectedOwnershipInfoTable.id,
              },
            },
          },
        });
        selectedOwnershipInfoTable = await context.prisma.ownershipInfo.update({
          where: { id: selectedOwnershipInfoTable.id },
          data: {
            data: {
              create: {
                parentCompany: ownershipInfoData.parent_company || '-',
                headquarters: ownershipInfoData.headquarters || '-',
                phone: ownershipInfoData.phone || '-',
                website: ownershipInfoData.website || '-',
                lastUpdate: ownershipInfoData.last_update || '-',
              },
            },
            updatedAt: new Date(),
          },
        });
      } catch {
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      let ownershipInfoUpdate: PyOwnershipInfoResponse = (
        await axios.get(`${API_URI}/api/info`, {
          params: {
            dataType: ownershipType,
            location: locationTag
              ? { locationType: locationTag.type, params: locationTag.params }
              : undefined,
            business: businessTag
              ? { businessType: businessTag.type, params: businessTag.params }
              : undefined,
          },
          paramsSerializer: axiosParamsSerializer,
        })
      ).data;
      let ownershipInfoData = ownershipInfoUpdate.data;
      selectedOwnershipInfoTable = await context.prisma.ownershipInfo.create({
        data: {
          data: {
            create: {
              parentCompany: ownershipInfoData.parent_company || '-',
              headquarters: ownershipInfoData.headquarters || '-',
              phone: ownershipInfoData.phone || '-',
              website: ownershipInfoData.website || '-',
              lastUpdate: ownershipInfoData.last_update || '-',
            },
          },
          type: ownershipType,
          businessTag: businessTag
            ? { connect: { id: businessTag.id } }
            : undefined,
          locationTag: locationTag
            ? { connect: { id: locationTag.id } }
            : undefined,
        },
      });
    } catch (e) {
      throw new Error('Fail to create data.');
    }
  }
  return selectedOwnershipInfoTable;
};

let ownershipInfoTable = queryField('ownershipInfoTable', {
  type: 'OwnershipInfo',
  args: {
    ownershipType: arg({ type: 'OwnershipType', required: true }),
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
    demo: arg({ type: 'DemoType' }),
  },
  resolve: ownershipInfoTableResolver,
});

export { ownershipInfoTable };
