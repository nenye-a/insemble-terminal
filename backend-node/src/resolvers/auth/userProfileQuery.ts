import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';

let userProfileResolver: FieldResolver<'Query', 'userProfile'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });
  if (!user) {
    throw new Error('user not found');
  }
  return user;
};

let userProfile = queryField('userProfile', {
  type: 'User',
  resolve: userProfileResolver,
});

export { userProfile };
