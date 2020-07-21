import { mutationField, arg, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

import { Context } from 'serverTypes';
import { PyPreprocessingResponse } from 'dataTypes';
import { todayMinXHour } from '../../helpers/todayMinXHour';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { API_URI } from '../../constants/constants';

import { deleteComparisonResolver } from './deleteComparisonMutation';

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
  /**
   * Endpoint for update (add, delete, delete all) comparison in table.
   */
  let selectedBusinessTag;
  let selectedLocationTag;

  if (businessTagId) {
    /**
     * Check if there is businessTagId or businessTag.
     * businessTagId is existing businessTag and can be search by Id.
     */
    selectedBusinessTag = await context.prisma.businessTag.findOne({
      where: { id: businessTagId },
    });
    if (!selectedBusinessTag) {
      throw new Error('Tag does not exist!');
    }
  } else if (businessTag) {
    let preprocessBusinessName;
    /**
     * If it's not businessTagId, and if it's businessTag object its self.
     * Preprocess the business name first.
     */
    try {
      let { business_name: pyPreprocessName }: PyPreprocessingResponse = (
        await axios.get(`${API_URI}/api/preprocess`, {
          params: {
            business: businessTag.params,
          },
          paramsSerializer: axiosParamsSerializer,
        })
      ).data;
    } catch {
      throw new Error('Something wrong when doing preprocessing.');
    }
    /**
     * If word contain bad or banned word it will give back null.
     */
    if (!preprocessBusinessName) {
      throw new Error(
        'Search contains banned word. Please try different input.',
      );
    }
    /**
     * Check if it's already on our side.
     */
    let businessTagsCheck = await context.prisma.businessTag.findMany({
      where: {
        params: preprocessBusinessName,
        type: businessTag.type,
      },
    });
    if (businessTagsCheck.length) {
      /**
       * If already exist then use the first found.
       */
      selectedBusinessTag = businessTagsCheck[0];
    } else {
      /**
       * Else create new tag with preprocessed BusinessName.
       */
      selectedBusinessTag = await context.prisma.businessTag.create({
        data: {
          params: preprocessBusinessName,
          type: businessTag.type,
        },
      });
    }
  }

  if (locationTag) {
    /**
     * Check if there is locationTag exist on our side.
     */
    let locationTagsCheck = await context.prisma.locationTag.findMany({
      where: {
        params: locationTag.params,
        type: locationTag.type,
      },
    });
    if (locationTagsCheck.length) {
      /**
       * If already exist then use the first found.
       */
      selectedLocationTag = locationTagsCheck[0];
    } else {
      /**
       * Else create new tag.
       */
      selectedLocationTag = await context.prisma.locationTag.create({
        data: {
          params: locationTag.params,
          type: locationTag.type,
        },
      });
    }
  }
  /**
   * Here we check if the combination of locationTag and businessTag exist in
   * comparationTag.
   */
  let comparationTags = await context.prisma.comparationTag.findMany({
    where: {
      businessTag: selectedBusinessTag ? { id: selectedBusinessTag.id } : null,
      locationTag: selectedLocationTag ? { id: selectedLocationTag.id } : null,
    },
    include: { businessTag: true, locationTag: true },
  });
  let comparationTag;
  if (!comparationTags.length) {
    /**
     * If it's doesn't exist then we create new comparationTags.
     */
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
    /**
     * Else use the first found.
     */
    comparationTag = comparationTags[0];
  }
  let table;
  let selectedComparationIds;
  let selectedComparationId = comparationTag.id;
  let newComparationIds: Array<string> = [];
  let tables;
  switch (reviewTag) {
    /**
     * Then we will check the table by reviewTag.
     * By default it will action as ADD.
     * The step are the same every reviewTag (1-13)
     */
    case 'PERFORMANCE':
      if (actionType === 'DELETE') {
        /**
         * (1)
         * If action type is DELETE then it have to be comparationTagId
         * that want to be deleted.
         */
        if (!comparationTagId) {
          throw new Error('Please select comparationTag you want to delete');
        }
        /**
         * (2)
         * Then delete it using deleteComparisonResolver.
         */
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
          /**
           * (3)
           * If the changes is on the terminal pinnedFeed.
           * Here we also update the pinnedFeed to be new table.
           * This make if we change the comparison also change the feed.
           */
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
      /**
       * (4)
       * Here where we check the table.
       */
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
        /**
         * (5)
         * If the action is DELETE_ALL then we search all the base table.
         */
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
        /**
         * (6)
         * Then filter out the table who have the comparationTags.
         * The data will be at first found.
         */
        performance = performance.filter(
          ({ comparationTags }) => comparationTags.length === 0,
        );
        if (pinId) {
          /**
           * (3)
           * If the changes is on the terminal pinnedFeed.
           * Here we also update the pinnedFeed to be new table.
           * This make if we change the comparison also change the feed.
           */
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
      /**
       * (7)
       * Here we check if the comparation we add if it's same tag as the base table.
       * Or already have same comparationTag in the table.
       */
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
      /**
       * (8)
       * Map the comparationTags into array of string ids so it's easy to manage.
       */
      selectedComparationIds = table.comparationTags.map(({ id }) => id);
      /**
       * (9)
       * We add the selectedComparationId into table selectedComparationIds.
       */
      newComparationIds = [...selectedComparationIds, selectedComparationId];
      /**
       * (10)
       * Search all table that have the compareTagId we want to add.
       */
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
      /**
       * (11)
       * Then fillter out the tables that have the comparation we want
       * to remove with exactly comparationIds we filter before.
       * (Must include all newComparationIds and same length)
       */
      tables = tables.filter(({ comparationTags }) => {
        return (
          comparationTags.every(({ id }) => newComparationIds.includes(id)) &&
          comparationTags.length === newComparationIds.length
        );
      });
      if (!tables.length) {
        /**
         * (12)
         * If the table doesn't exist then we create new one.
         */
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
        /**
         * (13)
         * Else we put the tables with the first found(index 0).
         */
        table = tables[0];
      }
      if (pinId) {
        /**
         * (3)
         * If the changes is on the terminal pinnedFeed.
         * Here we also update the pinnedFeed to be new table.
         * This make if we change the comparison also change the feed.
         */
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
  /**
   * If there are no reviewTag on above (ex:OWNERSHIP_CONTACT)
   * Then just return empty tags.
   * NOTE: This for table who can compare.
   */
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
