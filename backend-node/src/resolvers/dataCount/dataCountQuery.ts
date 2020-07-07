import { queryField, FieldResolver, arg, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let dataCountResolver: FieldResolver<'Query', 'dataCount'> = async (
  _: Root,
  args,
  context: Context,
) => {
  let { node } = args;
  let dataCount = 0;
  switch (node) {
    case 'TERMINALS':
      let terminals = await context.prisma.terminal.findMany({
        where: {
          user: {
            id: context.userId,
          },
        },
      });
      if (args.terminalSearch) {
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
