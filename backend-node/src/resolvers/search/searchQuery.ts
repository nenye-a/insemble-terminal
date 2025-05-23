import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let searchQueryResolver: FieldResolver<'Query', 'search'> = async (
  _: Root,
  { searchId },
  context: Context,
) => {
  /**
   * Endpoint for send back tags from searchLog with searchId.
   * This for history search so we can back to prev search.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  /**
   * Here we search the searchLog.
   */
  let search = await context.prisma.searchLog.findOne({
    where: {
      id: searchId,
    },
    include: { user: true, businessTag: true, locationTag: true },
  });

  /**
   * Then we check if the search history is exist and also check is it his/her
   * search log or not.
   * If not then throw error with message.
   */
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
