import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';

let userTerminalsResolver: FieldResolver<'Query', 'userTerminals'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  let terminals = await context.prisma.terminal.findMany({
    where: {
      user: {
        id: context.userId,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  return terminals;
};

let userTerminals = queryField('userTerminals', {
  type: 'Terminal',
  list: true,
  resolve: userTerminalsResolver,
});

export { userTerminals };
