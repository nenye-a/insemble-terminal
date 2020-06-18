import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let searchQueryResolver: FieldResolver<'Query', 'search'> = async (
  _: Root,
  { searchId },
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

  let search = await context.prisma.searchLog.findOne({
    where: {
      id: searchId,
    },
    include: { user: true, businessTag: true, locationTag: true },
  });

  if (!search) {
    throw new Error('Invalid search id.');
  }

  if (user.id !== search.user.id) {
    throw new Error('Cannot open others search log.');
  }

  return {
    searchId: search.id,
    reviewTag: search.reviewTag,
    businessTag: search.businessTag,
    locationTag: search.locationTag,
  };
};

let searchQuery = queryField('search', {
  type: 'Search',
  args: {
    searchId: stringArg({ required: true }),
  },
  resolve: searchQueryResolver,
});

export { searchQuery };
