import { mutationField, arg, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import axios from 'axios';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { API_URI } from '../../constants/constants';
import { PyPreprocessingResponse } from 'dataTypes';

export let searchResolver: FieldResolver<'Mutation', 'search'> = async (
  _,
  { reviewTag, businessTag, locationTag, businessTagId },
  context: Context,
) => {
  /**
   * Endpoint for processing search input.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }
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
      preprocessBusinessName = pyPreprocessName;
    } catch {
      // TODO: Handle if error.
      preprocessBusinessName = businessTag.params;
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
   * This where we create search log.
   */
  let search = await context.prisma.searchLog.create({
    data: {
      reviewTag,
      businessTag: selectedBusinessTag
        ? { connect: { id: selectedBusinessTag.id } }
        : undefined,
      locationTag: selectedLocationTag
        ? { connect: { id: selectedLocationTag.id } }
        : undefined,
      user: { connect: { id: user.id } },
    },
  });
  /**
   * Here we return.
   * searchId: for searchQuery.
   * businessTag: for table query that use businessTagId.
   * locationTag: for table query that use locationTagId.
   * reviewTag: to show what search reviewTag is.
   */
  return {
    searchId: search.id,
    reviewTag,
    businessTag: selectedBusinessTag,
    locationTag: selectedLocationTag,
  };
};

export let search = mutationField('search', {
  type: 'Search',
  args: {
    reviewTag: arg({ type: 'ReviewTag' }),
    businessTag: arg({ type: 'BusinessTagInput' }),
    businessTagId: stringArg(),
    locationTag: arg({ type: 'LocationTagInput' }),
  },
  resolve: searchResolver,
});
