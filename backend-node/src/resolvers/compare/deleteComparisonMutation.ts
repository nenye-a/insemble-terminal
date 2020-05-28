import { mutationField, arg, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let deleteComparisonResolver: FieldResolver<
  'Mutation',
  'deleteComparison'
> = async (_, { reviewTag, comparationTagId, tableId }, context: Context) => {
  let comparationTag = await context.prisma.comparationTag.findOne({
    where: {
      id: comparationTagId,
    },
    include: { businessTag: true, locationTag: true },
  });

  if (!comparationTag) {
    throw new Error('Comparation tag not found');
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
      let selectedComparationIds = table.comparationTags.map(({ id }) => id);
      let newComparationIds = selectedComparationIds.filter(
        (id) => id !== selectedComparationId,
      );
      let tables = await context.prisma.performance.findMany({
        where: {
          comparationTags: {
            every: { id: { not: selectedComparationId } },
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

export let deleteComparation = mutationField('deleteComparison', {
  type: 'ComparisonMutation',
  args: {
    reviewTag: arg({ type: 'ReviewTag', required: true }),
    comparationTagId: stringArg({ required: true }),
    tableId: stringArg({ required: true }),
  },
  resolve: deleteComparisonResolver,
});
