import { queryField, FieldResolver, intArg, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let userTerminalsResolver: FieldResolver<'Query', 'userTerminals'> = async (
  _: Root,
  { search, first, skip },
  context: Context,
) => {
  /**
   * Endpoint for showing all terminals user have. This endpoint can use pagination.
   * First we get all terminal that linked to user who use this endpoint.
   */
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
    /**
     * If user search something then it will filter out all the data that not
     * included on search string.
     */
    terminals = terminals.filter(({ name }) =>
      name.toLowerCase().includes(search.toLowerCase()),
    );
  }
  if (skip) {
    /**
     * The 'skip' is number of data user want to skip.
     * Example: If user have pagination 10 per page then when they fetch page 1
     * the skip will 0 which mean there is no data skiped. Then if user fetch page 2
     * then the skip will be 10, so the first 10 data will be skip and show data
     * from 11-20.
     */
    terminals = terminals.filter((_, index) => index >= skip);
  }
  if (first) {
    /**
     * The 'first' is number of data user want to get.
     * Example If user want to have pagination 10 per page then 'first' will be 10.
     * It will only given number of 'first' data. If the 'first':1 then only one data
     * will be given.
     */
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
