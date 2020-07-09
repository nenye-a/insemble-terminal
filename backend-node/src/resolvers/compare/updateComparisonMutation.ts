import { mutationField, arg, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import { deleteComparisonResolver } from './deleteComparisonMutation';
import { todayMinXHour } from '../../helpers/todayMinXHour';

export let updateComparisonResolver: FieldResolver<
  'Mutation',
  'updateComparison'
> = async (
  _,
  {
    reviewTag,
    businessTag,
    locationTag,
    businessTagId,
    tableId,
    actionType,
    comparationTagId,
    pinId,
  },
  context: Context,
  info,
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
  let table;
  let selectedComparationIds;
  let selectedComparationId = comparationTag.id;
  let newComparationIds: Array<string> = [];
  let tables;
  switch (reviewTag) {
    case 'PERFORMANCE':
      if (actionType === 'DELETE') {
        if (!comparationTagId) {
          throw new Error('Please select comparationTag you want to delete');
        }
        let {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        } = await deleteComparisonResolver(
          _,
          { reviewTag, comparationTagId, tableId },
          context,
          info,
        );
        let newTableId = await promiseTableId;
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: newTableId,
            },
          });
        }

        return {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        };
      }
      table = await context.prisma.performance.findOne({
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

      if (!table) {
        throw new Error('Selected table not found.');
      }
      if (actionType === 'DELETE_ALL') {
        let performance = await context.prisma.performance.findMany({
          where: {
            type: table.type,
            businessTag: table.businessTag
              ? { id: table.businessTag.id }
              : null,
            locationTag: table.locationTag
              ? { id: table.locationTag.id }
              : null,
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
        performance = performance.filter(
          ({ comparationTags }) => comparationTags.length === 0,
        );
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: performance[0].id,
            },
          });
        }
        return {
          reviewTag,
          tableId: performance[0].id,
          comparationTags: performance[0].comparationTags,
        };
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
      selectedComparationIds = table.comparationTags.map(({ id }) => id);
      newComparationIds = [...selectedComparationIds, selectedComparationId];
      tables = await context.prisma.performance.findMany({
        where: {
          comparationTags: {
            some: { id: selectedComparationId },
          },
          type: table.type,
          businessTag: table.businessTag ? { id: table.businessTag.id } : null,
          locationTag: table.locationTag ? { id: table.locationTag.id } : null,
          demo: null,
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
            updatedAt: todayMinXHour(1),
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
      if (pinId) {
        await context.prisma.pinnedFeed.update({
          where: { id: pinId },
          data: {
            tableId: table.id,
          },
        });
      }
      return {
        reviewTag,
        tableId: table.id,
        comparationTags: table.comparationTags,
      };
    case 'NEWS':
      if (actionType === 'DELETE') {
        if (!comparationTagId) {
          throw new Error('Please select comparationTag you want to delete');
        }
        let {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        } = await deleteComparisonResolver(
          _,
          { reviewTag, comparationTagId, tableId },
          context,
          info,
        );
        let newTableId = await promiseTableId;
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: newTableId,
            },
          });
        }

        return {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        };
      }
      table = await context.prisma.news.findOne({
        where: { id: tableId },
        select: {
          id: true,
          data: true,
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
      if (!table) {
        throw new Error('Selected table not found.');
      }
      if (actionType === 'DELETE_ALL') {
        let news = await context.prisma.news.findMany({
          where: {
            businessTag: table.businessTag
              ? { id: table.businessTag.id }
              : null,
            locationTag: table.locationTag
              ? { id: table.locationTag.id }
              : null,
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
        news = news.filter(
          ({ comparationTags }) => comparationTags.length === 0,
        );
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: news[0].id,
            },
          });
        }
        return {
          reviewTag,
          tableId: news[0].id,
          comparationTags: news[0].comparationTags,
        };
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
      selectedComparationIds = table.comparationTags.map(({ id }) => id);
      newComparationIds = [...selectedComparationIds, selectedComparationId];
      tables = await context.prisma.news.findMany({
        where: {
          comparationTags: {
            some: { id: selectedComparationId },
          },
          businessTag: table.businessTag ? { id: table.businessTag.id } : null,
          locationTag: table.locationTag ? { id: table.locationTag.id } : null,
          demo: null,
        },
        select: {
          id: true,
          data: true,
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
        table = await context.prisma.news.create({
          data: {
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
            updatedAt: todayMinXHour(1),
          },
          select: {
            id: true,
            data: true,
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
      if (pinId) {
        await context.prisma.pinnedFeed.update({
          where: { id: pinId },
          data: {
            tableId: table.id,
          },
        });
      }
      return {
        reviewTag,
        tableId: table.id,
        comparationTags: table.comparationTags,
      };
    case 'ACTIVITY':
      if (actionType === 'DELETE') {
        if (!comparationTagId) {
          throw new Error('Please select comparationTag you want to delete');
        }
        let {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        } = await deleteComparisonResolver(
          _,
          { reviewTag, comparationTagId, tableId },
          context,
          info,
        );
        let newTableId = await promiseTableId;
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: newTableId,
            },
          });
        }

        return {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        };
      }
      table = await context.prisma.activity.findOne({
        where: { id: tableId },
        select: {
          id: true,
          data: true,
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

      if (!table) {
        throw new Error('Selected table not found.');
      }
      if (actionType === 'DELETE_ALL') {
        let activity = await context.prisma.activity.findMany({
          where: {
            businessTag: table.businessTag
              ? { id: table.businessTag.id }
              : null,
            locationTag: table.locationTag
              ? { id: table.locationTag.id }
              : null,
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
        activity = activity.filter(
          ({ comparationTags }) => comparationTags.length === 0,
        );
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: activity[0].id,
            },
          });
        }
        return {
          reviewTag,
          tableId: activity[0].id,
          comparationTags: activity[0].comparationTags,
        };
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
      selectedComparationIds = table.comparationTags.map(({ id }) => id);
      newComparationIds = [...selectedComparationIds, selectedComparationId];
      tables = await context.prisma.activity.findMany({
        where: {
          comparationTags: {
            some: { id: selectedComparationId },
          },
          businessTag: table.businessTag ? { id: table.businessTag.id } : null,
          locationTag: table.locationTag ? { id: table.locationTag.id } : null,
          demo: null,
        },
        select: {
          id: true,
          data: true,
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
        table = await context.prisma.activity.create({
          data: {
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
            updatedAt: todayMinXHour(1),
          },
          select: {
            id: true,
            data: true,
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
      if (pinId) {
        await context.prisma.pinnedFeed.update({
          where: { id: pinId },
          data: {
            tableId: table.id,
          },
        });
      }
      return {
        reviewTag,
        tableId: table.id,
        comparationTags: table.comparationTags,
      };
    case 'MAP':
      if (actionType === 'DELETE') {
        if (!comparationTagId) {
          throw new Error('Please select comparationTag you want to delete');
        }
        let {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        } = await deleteComparisonResolver(
          _,
          { reviewTag, comparationTagId, tableId },
          context,
          info,
        );
        let newTableId = await promiseTableId;
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: newTableId,
            },
          });
        }

        return {
          comparationTags: promiseCompareTags,
          reviewTag: promiseReviewTag,
          tableId: promiseTableId,
        };
      }
      table = await context.prisma.map.findOne({
        where: { id: tableId },
        select: {
          id: true,
          data: true,
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

      if (!table) {
        throw new Error('Selected table not found.');
      }
      if (actionType === 'DELETE_ALL') {
        let map = await context.prisma.map.findMany({
          where: {
            businessTag: table.businessTag
              ? { id: table.businessTag.id }
              : null,
            locationTag: table.locationTag
              ? { id: table.locationTag.id }
              : null,
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
        if (pinId) {
          await context.prisma.pinnedFeed.update({
            where: { id: pinId },
            data: {
              tableId: map[0].id,
            },
          });
        }

        return {
          reviewTag,
          tableId: map[0].id,
          comparationTags: map[0].comparationTags,
        };
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
      selectedComparationIds = table.comparationTags.map(({ id }) => id);
      newComparationIds = [...selectedComparationIds, selectedComparationId];
      tables = await context.prisma.map.findMany({
        where: {
          comparationTags: {
            some: { id: selectedComparationId },
          },
          businessTag: table.businessTag ? { id: table.businessTag.id } : null,
          locationTag: table.locationTag ? { id: table.locationTag.id } : null,
          demo: null,
        },
        select: {
          id: true,
          data: true,
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
        table = await context.prisma.map.create({
          data: {
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
            updatedAt: todayMinXHour(1),
          },
          select: {
            id: true,
            data: true,
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
      if (pinId) {
        await context.prisma.pinnedFeed.update({
          where: { id: pinId },
          data: {
            tableId: table.id,
          },
        });
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

export let updateComparation = mutationField('updateComparison', {
  type: 'ComparisonMutation',
  args: {
    actionType: arg({ type: 'CompareActionType', required: true }),
    comparationTagId: stringArg(),
    reviewTag: arg({ type: 'ReviewTag', required: true }),
    businessTag: arg({ type: 'BusinessTagInput' }),
    businessTagId: stringArg(),
    locationTag: arg({ type: 'LocationTagInput' }),
    tableId: stringArg({ required: true }),
    pinId: stringArg(),
  },
  resolve: updateComparisonResolver,
});
