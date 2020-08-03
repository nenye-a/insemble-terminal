import { queryField, FieldResolver, arg, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let dataCountResolver: FieldResolver<'Query', 'dataCount'> = async (
  _: Root,
  args,
  context: Context,
) => {
  /**
   * Endpoint for fetch data count on spesific node for pagination.
   */
  let { node } = args;
  let dataCount = 0;
  switch (node) {
    /**
     * Will count length of the search data by node and args.
     */
    case 'TERMINALS':
      /**
       * This for terminals pagination so the paginate know how much data and
       * determine how much page will it be.
       */
      let terminals = await context.prisma.terminal.findMany({
        where: {
          user: {
            id: context.userId,
          },
        },
      });
      if (args.terminalSearch) {
        /**
         * If there's search will only show length of the searched item.
         */
        terminals = terminals.filter(({ name }) =>
          name.toLowerCase().includes(args.terminalSearch.toLowerCase()),
        );
      }
      dataCount = terminals.length;
      break;
  }

  return dataCount;
};

let dataCount = queryField('dataCount', {
  type: 'Int',
  args: {
    node: arg({ type: 'DataCountNode', required: true }),
    terminalSearch: stringArg(),
  },
  resolve: dataCountResolver,
});

export { dataCount };
