import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios from 'axios';

import { BusinessTagCreateInput, LocationTagCreateInput } from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyOwnershipContactResponse } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { ContactDemoData } from '../../constants/demoData';

let ownershipContactTableResolver: FieldResolver<
  'Query',
  'ownershipContactTable'
> = async (
  _: Root,
  { ownershipType, businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  /**
   * Endpoint for geting contact table.
   * If there is demo in args then it's automaticaly use demo data.
   * demo consist 'BASIC' and 'WITH_COMPARE'
   */
  if (demo) {
    /**
     * Here we search all table with the same demo params.
     */
    let demoTables = await context.prisma.ownershipContact.findMany({
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
           * If BASIC then we're just add ContactDemoData.
           * The demo data can be seen at demoData.ts.
           * NOTE: Only company contact.
           */
          if (ownershipType === 'COMPANY') {
            demoTable = await context.prisma.ownershipContact.create({
              data: {
                data: {
                  create: ContactDemoData,
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
           * Can't compare contact table.
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
  let ownershipContact;
  /**
   * Or the user already know the table want to get with tableId. (Usally used
   * on pinned and comparation table)
   * It will search table by Id here.
   */
  if (tableId) {
    let selectedOwnershipContactById = await context.prisma.ownershipContact.findOne(
      {
        where: { id: tableId },
        include: {
          locationTag: true,
          businessTag: true,
        },
      },
    );
    if (!selectedOwnershipContactById) {
      throw new Error('Table not found');
    }
    if (selectedOwnershipContactById.demo) {
      /**
       * But if it's demo then we won't do anything to that table and just return it.
       */
      return selectedOwnershipContactById;
    }
    ownershipContact = [selectedOwnershipContactById];
  } else {
    /**
     * If it's not by id then we search it with business and location tag.
     */
    ownershipContact = await context.prisma.ownershipContact.findMany({
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

  let selectedOwnershipContactTable;
  /**
   * Here we check if the table exist from process above.
   */
  if (ownershipContact.length) {
    selectedOwnershipContactTable = ownershipContact[0];
    /**
     * If exist then we're just use the first found table.
     */
    let updateData = timeCheck(
      selectedOwnershipContactTable.updatedAt,
      TABLE_UPDATE_TIME,
    );
    /**
     * If table outdated from timeCheck then we have to update data.
     */
    if (updateData) {
      try {
        /**
         * Here we getting the contact data and put it on ownershipContactUpdate.
         */
        let ownershipContactUpdate: PyOwnershipContactResponse = (
          await axios.get(`${API_URI}/api/contact`, {
            params: {
              dataType: ownershipType,
              location: selectedOwnershipContactTable.locationTag
                ? {
                    locationType:
                      selectedOwnershipContactTable.locationTag.type,
                    params: selectedOwnershipContactTable.locationTag.params,
                  }
                : undefined,
              business: selectedOwnershipContactTable.businessTag
                ? {
                    businessType:
                      selectedOwnershipContactTable.businessTag.type,
                    params: selectedOwnershipContactTable.businessTag.params,
                  }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          })
        ).data;
        /**
         * Then we parse python data we get into our DB data type.
         */
        let ownershipContactData = ownershipContactUpdate.data.map(
          ({ name, email, phone, title }) => {
            return {
              name: name || '-',
              title: title || '-',
              phone: phone || '-',
              email: email || '-',
            };
          },
        );
        /**
         * Here we delete all old data.
         */
        await context.prisma.ownershipContactData.deleteMany({
          where: {
            ownershipContact: {
              id: selectedOwnershipContactTable.id,
            },
          },
        });
        /**
         * Then finally we update the table here with data we parse above.
         */
        selectedOwnershipContactTable = await context.prisma.ownershipContact.update(
          {
            where: { id: selectedOwnershipContactTable.id },
            data: {
              data: { create: ownershipContactData },
              updatedAt: new Date(),
            },
          },
        );
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
      let ownershipContactUpdate: PyOwnershipContactResponse = (
        await axios.get(`${API_URI}/api/contact`, {
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
       * Then we parse python data we get into our DB data type.
       */
      let ownershipContactData = ownershipContactUpdate.data.map(
        ({ name, email, phone, title }) => {
          return {
            name: name || '-',
            title: title || '-',
            phone: phone || '-',
            email: email || '-',
          };
        },
      );
      /**
       * Then we create table with the data here.
       */
      selectedOwnershipContactTable = await context.prisma.ownershipContact.create(
        {
          data: {
            data: { create: ownershipContactData },
            type: ownershipType,
            businessTag: businessTag
              ? { connect: { id: businessTag.id } }
              : undefined,
            locationTag: locationTag
              ? { connect: { id: locationTag.id } }
              : undefined,
          },
        },
      );
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
  return selectedOwnershipContactTable;
};

let ownershipContactTable = queryField('ownershipContactTable', {
  type: 'OwnershipContact',
  args: {
    ownershipType: arg({ type: 'OwnershipType', required: true }),
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
    demo: arg({ type: 'DemoType' }),
  },
  resolve: ownershipContactTableResolver,
});

export { ownershipContactTable };
