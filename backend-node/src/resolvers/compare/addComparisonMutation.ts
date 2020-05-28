import { mutationField, arg, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let addComparisonResolver: FieldResolver<
  'Mutation',
  'addComparison'
> = async (
  _,
  { reviewTag, businessTag, locationTag, businessTagId, tableId },
  context: Context,
) => {
  let selectedBusinessTag;
  let selectedLocationTag;

  if (businessTagId) {
    selectedBusinessTag = await context.prisma.businessTag.findOne({
      where: { id: businessTagId },
    });
    if (!selectedBusinessTag) {
      throw new Error('Tag does not exist!');
    }
  } else if (businessTag) {
    let businessTagsCheck = await context.prisma.businessTag.findMany({
      where: {
        params: businessTag.params,
        type: businessTag.type,
      },
    });
    if (businessTagsCheck.length) {
      selectedBusinessTag = businessTagsCheck[0];
    } else {
      // TODO: preprocess typo data before save
      selectedBusinessTag = await context.prisma.businessTag.create({
        data: {
          params: businessTag.params,
          type: businessTag.type,
        },
      });
    }
  }

  if (locationTag) {
    let locationTagsCheck = await context.prisma.locationTag.findMany({
      where: {
        params: locationTag.params,
        type: locationTag.type,
      },
    });
    if (locationTagsCheck.length) {
      selectedLocationTag = locationTagsCheck[0];
    } else {
      selectedLocationTag = await context.prisma.locationTag.create({
        data: {
          params: locationTag.params,
          type: locationTag.type,
        },
      });
    }
  }
  let comparationTags = await context.prisma.comparationTag.findMany({
    where: {
      businessTag: selectedBusinessTag
        ? { id: selectedBusinessTag.id }
        : undefined,
      locationTag: selectedLocationTag
        ? { id: selectedLocationTag.id }
        : undefined,
    },
    include: { businessTag: true, locationTag: true },
  });
  let comparationTag;
  if (!comparationTags.length) {
    comparationTag = await context.prisma.comparationTag.create({
      data: {
        businessTag: selectedBusinessTag
          ? { connect: { id: selectedBusinessTag.id } }
          : undefined,
        locationTag: selectedLocationTag
          ? { connect: { id: selectedLocationTag.id } }
          : undefined,
      },
      include: { businessTag: true, locationTag: true },
    });
  } else {
    comparationTag = comparationTags[0];
  }

  switch (reviewTag) {
    case 'PERFORMANCE':
      let table = await context.prisma.performance.findOne({
        where: { id: tableId },
        select: {
          id: true,
          data: true,
          type: true,
          businessTag: true,
          locationTag: true,
          comparationTags: {
            select: {
              id: true,
              businessTag: true,
              locationTag: true,
            },
          },
        },
      });
      let selectedComparationId = comparationTag.id;
      if (!table) {
        throw new Error('Selected table not found.');
      }
      if (
        table.businessTag?.id === comparationTag.businessTag?.id &&
        table.locationTag?.id === comparationTag.locationTag?.id
      ) {
        throw new Error('Cannot compare the same tag');
      }
      if (
        table.comparationTags.some(({ id }) => selectedComparationId === id)
      ) {
        throw new Error('Cannot add with same comparation.');
      }
      let selectedComparationIds = table.comparationTags.map(({ id }) => id);
      let newComparationIds = [
        ...selectedComparationIds,
        selectedComparationId,
      ];
      let tables = await context.prisma.performance.findMany({
        where: {
          comparationTags: {
            some: { id: selectedComparationId },
          },
          type: table.type,
          businessTag: table.businessTag ? { id: table.businessTag.id } : null,
          locationTag: table.locationTag ? { id: table.locationTag.id } : null,
        },
        select: {
          id: true,
          data: true,
          type: true,
          businessTag: true,
          locationTag: true,
          comparationTags: {
            select: {
              id: true,
              businessTag: true,
              locationTag: true,
            },
          },
        },
      });
      tables = tables.filter(({ comparationTags }) => {
        return (
          comparationTags.every(({ id }) => newComparationIds.includes(id)) &&
          comparationTags.length === newComparationIds.length
        );
      });
      if (!tables.length) {
        let connectNewCompIds = newComparationIds.map((compId) => {
          return { id: compId };
        });
        table = await context.prisma.performance.create({
          data: {
            type: table.type,
            businessTag: table.businessTag
              ? {
                  connect: {
                    id: table.businessTag.id,
                  },
                }
              : undefined,
            locationTag: table.locationTag
              ? {
                  connect: {
                    id: table.locationTag.id,
                  },
                }
              : undefined,
            comparationTags: {
              connect: connectNewCompIds,
            },
            updatedAt: new Date(new Date().getTime() - 60 * 60000),
          },
          select: {
            id: true,
            data: true,
            type: true,
            businessTag: true,
            locationTag: true,
            comparationTags: {
              select: {
                id: true,
                businessTag: true,
                locationTag: true,
              },
            },
          },
        });
      } else {
        table = tables[0];
      }
      return {
        reviewTag,
        tableId: table.id,
        comparationTags: table.comparationTags,
      };
    default:
  }
  return {
    reviewTag,
    tableId: '',
    comparationTags: [],
  };
};

export let addComparation = mutationField('addComparison', {
  type: 'ComparisonMutation',
  args: {
    reviewTag: arg({ type: 'ReviewTag', required: true }),
    businessTag: arg({ type: 'BusinessTagInput' }),
    businessTagId: stringArg(),
    locationTag: arg({ type: 'LocationTagInput' }),
    tableId: stringArg({ required: true }),
  },
  resolve: addComparisonResolver,
});
