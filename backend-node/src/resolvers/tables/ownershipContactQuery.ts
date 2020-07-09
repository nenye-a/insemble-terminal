import { queryField, FieldResolver, arg, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyOwnershipContactResponse } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';

let ownershipContactTableResolver: FieldResolver<
  'Query',
  'ownershipContactTable'
> = async (
  _: Root,
  { ownershipType, businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  if (demo) {
    let demoTables = await context.prisma.ownershipContact.findMany({
      where: {
        demo,
        type: ownershipType,
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
  let ownershipContact;
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
      return selectedOwnershipContactById;
    }
    ownershipContact = [selectedOwnershipContactById];
  } else {
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
  if (ownershipContact.length) {
    selectedOwnershipContactTable = ownershipContact[0];
    let updateData = timeCheck(
      selectedOwnershipContactTable.updatedAt,
      TABLE_UPDATE_TIME,
    );
    if (updateData) {
      try {
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
        await context.prisma.ownershipContactData.deleteMany({
          where: {
            ownershipContact: {
              id: selectedOwnershipContactTable.id,
            },
          },
        });
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
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
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
      throw new Error('Fail to create data.');
    }
  }
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
