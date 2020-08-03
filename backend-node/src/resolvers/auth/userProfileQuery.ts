import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';

let userProfileResolver: FieldResolver<'Query', 'userProfile'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  /**
   * Endpoint for fetching user profile data.
   * Here we search the user by context.userId.
   * context.userId will be there if the user send the valid bearer token.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });
  if (!user) {
    throw new Error('user not found');
  }
  /**
   * This will return user data that on User typeSchemas.
   */
  return user;
};

let userProfile = queryField('userProfile', {
  type: 'User',
  resolve: userProfileResolver,
});

export { userProfile };
