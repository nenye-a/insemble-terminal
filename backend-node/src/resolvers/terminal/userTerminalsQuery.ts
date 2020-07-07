import { queryField, FieldResolver, intArg, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let userTerminalsResolver: FieldResolver<'Query', 'userTerminals'> = async (
  _: Root,
  { search, first, skip },
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
  if (search) {
    terminals = terminals.filter(({ name }) =>
      name.toLowerCase().includes(search.toLowerCase()),
    );
  }
  if (skip) {
    terminals = terminals.filter((_, index) => index >= skip);
  }
  if (first) {
    terminals = terminals.filter((_, index) => index < first);
  }

  return terminals;
};

let userTerminals = queryField('userTerminals', {
  type: 'Terminal',
  list: true,
  args: {
    search: stringArg(),
    first: intArg(),
    skip: intArg(),
  },
  resolve: userTerminalsResolver,
});

export { userTerminals };
