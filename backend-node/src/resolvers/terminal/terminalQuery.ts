import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let terminalResolver: FieldResolver<'Query', 'terminal'> = async (
  _: Root,
  { terminalId },
  context: Context,
) => {
  /**
   * Endpoint for get data terminal. Require terminalId.
   * Here we check the terminal that user select.
   * The checks are: if exist? if terminal have user?
   * if terminal user are the same who use this endpoint?
   */
  let terminal = await context.prisma.terminal.findOne({
    where: {
      id: terminalId,
    },
    include: {
      user: true,
    },
  });
  if (!terminal) {
    throw new Error('Terminal not found.');
  }
  if (!terminal.user) {
    throw new Error('Terminal not connected to user.');
  }
  if (terminal.user.id !== context.userId) {
    throw new Error('This is not your terminal.');
  }
  /**
   * Here we return the terminal data and all its feed on it.
   */
  return terminal;
};

let terminal = queryField('terminal', {
  type: 'Terminal',
  args: {
    terminalId: stringArg({ required: true }),
  },
  resolve: terminalResolver,
});

export { terminal };
