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
  /**
   * Endpoint for geting company/property (only company for now) info table.
   * If there is demo in args then it's automaticaly use demo data.
   * demo consist 'BASIC' and 'WITH_COMPARE'
   */
  if (demo) {
    /**
     * Here we search all table with the same demo params.
     */
    let demoTables = await context.prisma.ownershipInfo.findMany({
      where: {
        demo,
        type: ownershipType,
      },
    });
    let demoTable;
    if (!demoTables.length) {
      /**
       * If it's doesn't exist then we create new with this parameter.
       */
      let businessTag: BusinessTagCreateInput = {
        params: 'Cheesecake Factory',
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
        params: '511 Americana Way, Glendale, CA 91210, USA',
        type: 'ADDRESS',
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
           * If BASIC then we're just add InfoDemoData.
           * The demo data can be seen at demoData.ts.
           * NOTE: Only company info.
           */
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
          /**
           * Can't compare info table.
           */
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
  let ownershipInfo;
  /**
   * Or the user already know the table want to get with tableId. (Usally used
   * on pinned and comparation table)
   * It will search table by Id here.
   */
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
      /**
       * But if it's demo then we won't do anything to that table and just return it.
       */
      return selectedOwnershipInfoById;
    }
    ownershipInfo = [selectedOwnershipInfoById];
  } else {
    /**
     * If it's not by id then we search it with business and location tag.
     */
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
  /**
   * Here we check if the table exist from process above.
   */
  if (ownershipInfo.length) {
    selectedOwnershipInfoTable = ownershipInfo[0];
    /**
     * If exist then we're just use the first found table.
     */
    let updateData = timeCheck(
      selectedOwnershipInfoTable.updatedAt,
      TABLE_UPDATE_TIME,
    );
    /**
     * If table outdated from timeCheck then we have to update data.
     */
    if (updateData) {
      try {
        /**
         * Here we getting the info data and put it on ownershipContactUpdate.
         */
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
        /**
         * Then we didn't need parse because python data is same as DB data type.
         */
        let ownershipInfoData = ownershipInfoUpdate.data;
        /**
         * Then finally we update the table here with data.
         * Also we null check when we create it.
         */
        selectedOwnershipInfoTable = await context.prisma.ownershipInfo.update({
          where: { id: selectedOwnershipInfoTable.id },
          data: {
            data: {
              update: {
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
        /**
         * Then if something wrong then we throw an error.
         */
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      /**
       * Here is the case when there is no basic table.
       * So we create one here. Basically the same as above but we create new table.
       * Here we get the data from python.
       */
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
      /**
       * Then we didn't need parse because python data is same as DB data type.
       */
      let ownershipInfoData = ownershipInfoUpdate.data;
      /**
       * Then we create table with the data here.
       * Also we null check when we create it.
       */
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
      /**
       * Then if something wrong then we throw an error.
       */
      throw new Error('Fail to create data.');
    }
  }
  /**
   * Here we return all data front end need.
   */
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
