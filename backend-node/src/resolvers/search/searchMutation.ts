import { mutationField, arg, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let searchResolver: FieldResolver<'Mutation', 'search'> = async (
  _,
  { reviewTag, businessTag, locationTag, businessTagId },
  context: Context,
) => {
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
